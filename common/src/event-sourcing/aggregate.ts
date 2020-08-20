import { Id } from '../types';
import { EventsStream } from './events-stream';
import { StreamVersion } from './stream-version';
import {
  IDomainEvent,
  EVENT_NAME_METADATA,
  eventDeserializer,
} from './domain-event';
import { EventName } from '../types';
import { StoredSnapshot } from './stored-snapshot';
import { StoredEvent } from './stored-event';
import { ReplayVersionMismatchException } from './replay-version-mismatch-exception';

export abstract class Aggregate<TSerialized = Record<any, any>> {
  protected abstract id: Id;
  protected abstract serialize(): TSerialized;
  protected abstract deserialize(data: TSerialized): void;

  private eventsStream: EventsStream | undefined;
  private version = StreamVersion.start();
  private persistedVersion = StreamVersion.start();

  get persistedAggregateVersion(): number {
    return this.persistedVersion.toNumber();
  }

  get aggregateVersion(): number {
    return this.version.toNumber();
  }

  get aggregateId(): Id {
    return this.id;
  }

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
    if (!this.eventsStream)
      this.eventsStream = EventsStream.create(this.id);
    this.eventsStream.addEvent(event, this.version);
  }

  /**
   * Calls appropriate mutation method and increases aggregate
   * instance version.
   * @param event Occured Domain Event.
   */
  protected mutate(
    event: IDomainEvent,
    increasePersistedVersion = false
  ): void {
    // Get the event name from metadata. It has to be set
    // by @DomainEvent decorator
    const eventName = EventName.create(
      Reflect.getMetadata(EVENT_NAME_METADATA, event)
    );

    // Get event handler from `this` instance for the event.
    // The handler is set by @ApplyDomainEvent decorator.
    const handlerName = Reflect.getMetadata(eventName.toString(), this);
    if (handlerName) {
      (this as any)[handlerName](event);
    }

    // Increase persisted version
    if (increasePersistedVersion) this.persistedVersion.next();

    // Increase the version
    this.version.next();
  }

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

  protected applySnapshot(
    snapshot: StoredSnapshot<TSerialized>,
    eventsAfter: StoredEvent[]
  ): void {
    this.deserialize(snapshot.data);
    this.version = StreamVersion.from(snapshot.version);
    this.persistedVersion = StreamVersion.from(snapshot.version);
    this.replayEvents(eventsAfter);
  }

  /**
   * Dumps events stream.
   * @returns Stream of events deleted from `this` instance.
   */
  resetEvents(): EventsStream {
    const stream = this.eventsStream || EventsStream.create(this.id);
    this.eventsStream = EventsStream.create(this.id);
    return stream;
  }
}
