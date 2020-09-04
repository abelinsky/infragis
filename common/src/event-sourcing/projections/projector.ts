import { inject, injectable } from 'inversify';

import { LOGGER_TYPE } from '../../dependency-injection';
import { ITransactionable } from '../../persistence/transactionable';
import { EventName } from '../../types';
import { ILogger } from '../../utils';
import { StoredEvent } from '../core/stored-event';

export interface IProjector {
  /**
   * Starts listening and handling events.
   */
  start(): Promise<void>;

  /**
   * Stops listening and handling events.
   */
  stop(): Promise<void>;

  /**
   * Gets current track position in the Events Stream
   * that indicates the number of the events that
   * have been already processed by the Projector.
   * Note that a particular Projector can have many
   * topics that it is interested in. Therefore it is
   * necessary to track offsets independently by topic.
   * @param topic Topic name from {@link EventName}.
   * @note
   */
  getOffset(topic: string): Promise<number>;

  /**
   * Sets the offset to the last processed event.
   * @param lastProjectedEvent Event that was already processed by this
   *     projector.
   */
  setOffset(lastProjectedEvent: StoredEvent): Promise<void>;

  /**
   * Gets the array of events after specified position/offset/sequence number
   * (not including it) that the projector is interested in.
   * @param after The position of the event after which to fetch the events.
   * @param topic Topic to fetch events from.
   *
   */
  getEvents(after: number, topic: string): Promise<StoredEvent[]>;

  /**
   * Applies event to the Projector. Calls event handler
   * method declared in the projector and moves forward
   * the Projector's position (see {@link IProjector#getPosition}).
   * @param event Event to be applied.
   */
  apply(event: StoredEvent): Promise<boolean>;

  /**
   * Replays events from last watched position up to the end of
   * the events stream.
   */
  replay(): Promise<void>;

  /**
   * Gets an array of topics that the Projector is listening to.
   */
  getTopics(): string[];
}

export const PROJECTOR_HANDLER_TOPICS = '__PROJECTOR_HANDLER_TOPICS__';

/**
 * Base class for the Projectors that are responsible for handling domain events
 * (occured inside the service) and/or notifications (received through
 * MessageQueue) and projecting those events into some state that corresponds to
 * the moment in time when this domain event/notification occurred.
 *
 * @example
 *
 *
 *     @injectable()
 *     export class PostgresUserProjector extends PostgresDomesticProjector {
 *       groupId = 'user_projector';
 *       private eventStore = this.eventStoreFactory('user_events');
 *       private sessionEventStore = this.eventStoreFactory('session_events');
 *
 *       ...
 *
 *       async getEvents(after: number, topic: string): Promise<StoredEvent[]> {
 *         switch (topic) {
 *           case
 * EventName.fromString(AuthenticationEvents.EventNames.UserCreated).getTopic():
 *             return await this.eventStore.getAllEvents(after);
 *           case
 * EventName.fromString(AuthenticationEvents.EventNames.SignUpRequested).getTopic():
 *             return await this.sessionEventStore.getAllEvents(after);
 *           default:
 *             throw new Error(
 *               `PostgresUserProjector is requested about the topic
 * \"${topic}\" while it is not interested in it.`
 *             );
 *         }
 *       }
 *
 *       @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
 *       async onUserCreated({ aggregateId, data }:
 * StoredEvent<AuthenticationEvents.UserCreatedData>) {
 *         ...
 *       }
 *
 *       @ProjectionHandler(AuthenticationEvents.EventNames.SignUpRequested)
 *       async onSessionCreated({aggregateId, data}:
 * StoredEvent<AuthenticationEvents.SignUpRequestedData>) {
 *         ...
 *       }
 *     }
 */
@injectable()
export abstract class Projector implements IProjector {
  /**
   * Projector groups allow a group of the same projectors to coordinate access
   * to a list of topics. Projector groups must have unique group ids
   * within the service. @param `groupId` is used to track the offset
   * position of the events stream within the topic
   * (that is set by {@link EventName}).
   */
  // TODO: check uniqueness
  abstract readonly groupId: string;

  abstract async start(): Promise<void>;
  abstract async stop(): Promise<void>;
  abstract async getOffset(topic: string): Promise<number>;
  abstract async setOffset(lastProjectedEvent: StoredEvent): Promise<void>;
  abstract async getEvents(after: number, topic: string): Promise<StoredEvent[]>;

  protected abstract get transactionProvider(): ITransactionable;

  @inject(LOGGER_TYPE) logger!: ILogger;

  getTopics(): string[] {
    const topics: string[] = Reflect.getMetadata(PROJECTOR_HANDLER_TOPICS, this) || [];
    if (!topics.length) {
      throw new Error(
        `Class ${this.constructor.name} does not have methods decorated with @ProjectionHandler, please implement them.`
      );
    }
    return topics;
  }

  apply = async (event: StoredEvent): Promise<boolean> => {
    this.logger.debug(`$tr$Processing event ${event.name}`);

    const topic = EventName.fromString(event.name).getTopic();

    this.logger.debug('$tr$pre Projector await this.getOffset(topic)');

    const currentPosition = await this.getOffset(topic);
    if (event.sequence !== currentPosition + 1) {
      this.logger.warn(`Can not apply event ${event.eventId} with 
      sequence number ${event.sequence} to projector position 
      number ${currentPosition}
      `);
      return false;
    }

    this.logger.debug('$tr$pos Projector await this.getOffset(topic) in Projector');

    this.logger.debug('$tr$pre Projector await this.transactionProvider.transaction in Projector');

    // Run event processing in a transaction
    // await this.transactionProvider.transaction(() =>
    //   Promise.all([this.handleEvent(event), this.setOffset(event)])
    // );

    // TODO Run in one transaction
    await this.handleEvent(event);
    await this.setOffset(event);

    this.logger.debug('$tr$post Projector await this.transactionProvider.transaction in Projector');

    return true;
  };

  async replay(): Promise<void> {
    const topics = this.getTopics();

    for (const topic of topics) {
      const currentPosition = await this.getOffset(topic);
      const events = await this.getEvents(currentPosition, topic);
      if (!events.length) continue;

      for (const e of events) {
        await this.apply(e);
      }
    }
  }

  /**
   * Tries to find handler inside the class for processing
   * the specified event and to invoke it.
   * @param event Instance of {@see StoredEvent}.
   */
  private async handleEvent(event: StoredEvent): Promise<void> {
    // See ProjectionHandler
    const handlerName = Reflect.getMetadata(event.name, this);
    if (!handlerName) return;
    try {
      await (this as any)[handlerName](event);
    } catch (err) {
      this.logger.error(
        err,
        `Error occured in Projector while processing event id=${event.eventId}`
      );
      throw err;
    }
  }
}
