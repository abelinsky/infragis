import { Id } from '../../types';
import { EventsStream } from './events-stream';
import { StreamVersion } from './stream-version';
import { IDomainEvent, EVENT_NAME_METADATA, eventDeserializer } from './domain-event';
import { EventName } from '../../types';
import { StoredSnapshot } from './stored-snapshot';
import { StoredEvent } from './stored-event';
import { ReplayVersionMismatchException } from '../exceptions';

/**
 * Base class for the Aggregates.
 */
export abstract class Aggregate<TSerialized = Record<any, any>> {
  /**
   * Unique identity of the aggregate.
   */
  protected abstract id: Id;

  /**
   * Serializes aggregate data. Serialization is used in {@link Aggregate#snapshot}
   * method and goes into snapshot repository.
   */
  protected abstract serialize(): TSerialized;

  /**
   * Deserializes from snapshot data. Deserialization is used
   * in {@link Aggregate#applySnapshot}
   * to reconstitute aggregate's state from it's snapshot.
   * @param data Snapshot data.
   */
  protected abstract deserialize(data: TSerialized): void;

  private eventsStream: EventsStream | undefined;

  /**
   * Current version of the aggregate after mutating states
   * in {@link Aggregate#mutate} method.
   */
  private version = StreamVersion.start();

  /**
   * Version of persisted snapshot.
   */
  private persistedVersion = StreamVersion.start();

  get persistedAggregateVersion(): number {
    return this.persistedVersion.toNumber();
  }

  /**
   * Returns Current version of the aggregate after n-mutations of it's state.
   */
  get aggregateVersion(): number {
    return this.version.toNumber();
  }

  /**
   * Returns Unique Aggregate Identity for this instance.
   */
  get aggregateId(): Id {
    return this.id;
  }

  /**
   * Produces and returns a snapshot of current aggregate's state.
   */
  get snapshot(): StoredSnapshot<TSerialized> {
    return {
      aggregateId: this.aggregateId.toString(),
      version: this.aggregateVersion,
      data: this.serialize(),
    };
  }

  /**
   * Mutates state and adds event to EventsStream.
   * @param event Domain Event.
   */
  protected apply(event: IDomainEvent): void {
    this.mutate(event);
    if (!this.eventsStream) this.eventsStream = EventsStream.create(this.id);
    this.eventsStream.addEvent(event, this.version);
  }

  /**
   * Calls appropriate mutation method and increases aggregate
   * instance version.
   * @param event Occured Domain Event.
   */
  protected mutate(event: IDomainEvent, duringReplay = false): void {
    // Get the event name from metadata. It has to be set
    // by @DomainEvent decorator
    const eventName = EventName.fromString(Reflect.getMetadata(EVENT_NAME_METADATA, event));

    // Get event handler from `this` instance for the event.
    // The handler is set by @ApplyDomainEvent decorator.
    const handlerName = Reflect.getMetadata(eventName.toString(), this);
    if (handlerName) {
      (this as any)[handlerName](event);
    }

    // Increase persisted version
    if (duringReplay) this.persistedVersion.next();

    // Increase the version
    this.version.next();
  }

  /**
   * Replays events and applies them to mutate the state of the aggregate.
   * @param events Domain Events that occurred and are stored in the Event store.
   */
  protected replayEvents(events: StoredEvent[]): void {
    events.forEach((event) => {
      const deserializeHandler = eventDeserializer.get(event.name);
      if (!deserializeHandler)
        throw new Error(
          `Failed to replay ${event.name} event on aggregate ${this.aggregateId}.
           DomainEvent with deserialize method was not found.
          `
        );

      if (this.version.toNumber() + 1 != event.version)
        throw new ReplayVersionMismatchException(event, this.version);

      this.mutate(deserializeHandler(event.data), true);
    });
  }

  /**
   * Applies a snapshot and an array of events to current aggregate and produces it's new state.
   * @param snapshot Snapshot of the agregate's state.
   * @param eventsAfter An array of events that occurred after the snapshot has been persisted.
   */
  protected applySnapshot(snapshot: StoredSnapshot<TSerialized>, eventsAfter: StoredEvent[]): void {
    this.deserialize(snapshot.data);
    this.version = StreamVersion.from(snapshot.version);
    this.persistedVersion = StreamVersion.from(snapshot.version);
    this.replayEvents(eventsAfter);
  }

  /**
   * Dumps events stream.
   * @returns Stream of events removed from `this` instance.
   */
  resetEvents(): EventsStream {
    const stream = this.eventsStream || EventsStream.create(this.id);
    this.eventsStream = EventsStream.create(this.id);
    return stream;
  }
}
