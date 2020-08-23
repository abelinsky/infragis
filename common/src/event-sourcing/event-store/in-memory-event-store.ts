import { inject, injectable, interfaces } from 'inversify';
import { EventId, Id, Timestamp } from '../../types';
import { EVENT_NAME_METADATA } from '../core/domain-event';
import { DOMAIN_EVENTS_PUBLISHER, IDomainEventsPublisher } from '../publishing';
import { EventStore } from './event-store';
import { EventsStream } from '../core/events-stream';
import { OptimisticConcurrencyException } from '../exceptions';
import { StoredEvent } from '../core/stored-event';

@injectable()
export class InMemoryEventStore implements EventStore {
  @inject(DOMAIN_EVENTS_PUBLISHER) domainEventsPublisher!: IDomainEventsPublisher;

  private events: StoredEvent[] = [];
  private sequence: number = 0;

  async getEventsForAggregate(
    aggregateId: string,
    after?: number | undefined
  ): Promise<StoredEvent[]> {
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

  async storeEvents(events: EventsStream, expectedVersion: number): Promise<void> {
    if (!events.toArray().length) return;

    // Check for the Optimistic concurrency control issues.
    const lastEvent = await this.getLastEvent(events.aggregateId);

    if (lastEvent && lastEvent.version !== expectedVersion) {
      throw new OptimisticConcurrencyException(
        lastEvent.name,
        events.aggregateId.toString(),
        expectedVersion,
        lastEvent.sequence,
        lastEvent.eventId
      );
    }

    // Store events
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

    // Publish events
    this.domainEventsPublisher.publish(inserts);
  }

  private async getLastEvent(aggregateId: Id): Promise<StoredEvent> {
    return this.events
      .filter((e) => e.aggregateId === aggregateId.toString())
      .sort((first, second) => second.version - first.version)[0];
  }
}
