import { StoredEvent } from '../core/stored-event';
import { inject } from 'inversify';
import { LOGGER_TYPE, ILogger } from '../../utils';

export interface IProjector {
  /**
   * Gets current position in the Events Stream
   * that indicates the number of the events that
   *  have been already processed and saved by the Projector.
   */
  getPosition(): Promise<number>;

  /**
   * Increases the position of the Projector in the
   * Events Stream.
   */
  increasePosition(): Promise<void>;

  /**
   * Gets the array of events from specified position.
   * @param from The position of the event from which to fetch the events.
   */
  getEvents(from: number): Promise<StoredEvent[]>;

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
}

export abstract class Projector implements IProjector {
  @inject(LOGGER_TYPE) logger!: ILogger;

  abstract async getPosition(): Promise<number>;
  abstract async increasePosition(): Promise<void>;
  abstract async getEvents(from: number): Promise<StoredEvent[]>;

  apply = async (event: StoredEvent): Promise<boolean> => {
    const currentPosition = await this.getPosition();
    if (event.sequence !== currentPosition + 1) {
      this.logger.warn(`Can't apply event ${event.eventId} with 
      sequence number ${event.sequence} to projector position 
      number ${currentPosition}
      `);
      return false;
    }
    await this.handleEvent(event);
    await this.increasePosition();
    return true;
  };

  async replay(): Promise<void> {
    const currentPosition = await this.getPosition();
    const events = await this.getEvents(currentPosition);
    if (!events) return;

    for (const e of events) {
      await this.apply(e);
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
      this.logger.debug(`Trying to handle event ${event.name}...`);
      await (this as any)[handlerName](event);
    } catch (err) {
      this.logger.error(`Error occured in Projector while processing event id=${event.eventId}`);
      this.logger.error(err);
      throw err;
    }
  }
}

/**
 * Decorator to be used in the descendants of the Projector class
 * to define a handler for the given event.
 */
export const ProjectionHandler = (eventName: string): MethodDecorator => {
  return function ProjectionDecorator(
    target: any,
    methodName: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    if (!(target instanceof Projector)) {
      throw new Error(
        '@ProjectionDecorator can be used only inside Projector class descendants.' +
          `But ${target} does not extend Projector class.`
      );
    }
    // This metadata is used in `handleEvent` method of
    // the Projector class.
    Reflect.defineMetadata(eventName, methodName, target);
  };
};
