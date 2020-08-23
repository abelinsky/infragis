import { EventStore } from './event-store';
import { EventsStream } from '../core/events-stream';
import { StoredEvent } from '../core/stored-event';

// TODO: Implement
export class PostresEventStore implements EventStore {
  getEventsForAggregate(aggregateId: string, after?: number | undefined): Promise<StoredEvent[]> {
    throw new Error('Method not implemented.');
  }

  getEvents(from: number): Promise<StoredEvent[]> {
    throw new Error('Method not implemented.');
  }

  storeEvents(events: EventsStream, expectedVersion: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
