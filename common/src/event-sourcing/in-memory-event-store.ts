import { EventStore } from './event-store';
import { EventsStream } from './events-stream';
import { StoredEvent } from './stored-event';
import { inject, injectable, interfaces } from 'inversify';
import { Id, EventId, Timestamp } from '../types';
import { OptimisticConcurrencyControlException } from './optimistic-concurrency-control-exception';
import { EVENT_NAME_METADATA } from './domain-event';

@injectable()
export class InMemoryEventStore implements EventStore {
  topic!: string;

  private events: StoredEvent[] = [];
  private sequence: number = 0;

  async getEventsStream(aggregateId: string, after?: number | undefined): Promise<StoredEvent[]> {
    return this.events
      .filter((event) => event.aggregateId === aggregateId)
      .filter((event) => (after ? event.version > after : true))
      .sort((e1, e2) => e1.version - e2.version);
  }

  async getEvents(from: number = 0): Promise<StoredEvent[]> {
    return this.events
      .filter((event) => event.version >= from)
      .sort((e1, e2) => e1.version - e2.version);
  }

  async storeEvents(events: EventsStream, lastStoredVersion: number): Promise<void> {
    if (!events.toArray().length) return;

    // Check for the Optimistic concurrency control issues.
    const lastEvent = await this.getLastEvent(events.aggregateId);
    if (lastEvent && lastEvent.version !== lastStoredVersion) {
      throw new OptimisticConcurrencyControlException(
        this.topic,
        events.aggregateId.toString(),
        lastStoredVersion,
        lastEvent.sequence,
        lastEvent.eventId
      );
    }

    const inserts = events.toArray().map((e) => {
      this.sequence++;
      const storedEvent: StoredEvent = {
        eventId: EventId.generate().toString(),
        aggregateId: events.aggregateId.toString(),
        version: e.version.toNumber(),
        name: Reflect.getMetadata(EVENT_NAME_METADATA, e.event),
        data: e.event.serialize(),
        insertedAt: Timestamp.now().toString(),
        sequence: this.sequence,
      };
      return storedEvent;
    });

    inserts.forEach((e) => this.events.push(e));

    // TODO: dispatch events
    //await this.dispatcher.dispatch(this.topic, inserts);
  }

  private async getLastEvent(aggregateId: Id): Promise<StoredEvent> {
    return this.events
      .filter((e) => e.aggregateId === aggregateId.toString())
      .sort((first, second) => second.version - first.version)[0];
  }
}

export type InMemoryEventStoreFactory = (options: { topic: string }) => InMemoryEventStore;
export const inMemoryEventStoreFactory = (
  context: interfaces.Context
): InMemoryEventStoreFactory => {
  return ({ topic }) => {
    const store = context.container.get(InMemoryEventStore);
    store.topic = topic;
    return store;
  };
};
