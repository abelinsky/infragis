import { StoredEvent } from './stored-event';
import { EventsStream } from './events-stream';

export interface EventStore {
  /**
   * Gets an array of {@link StoredEvent} from the specified aggregate
   * that occured after the specified version of the aggregate.
   * @param aggregateId Id of the aggregate under request.
   * @param after The sequence number of the last event.
   */
  getEventsStream(aggregateId: string, after?: number): Promise<StoredEvent[]>;

  /**
   * Gets events from the specified version.
   * @param from Version of the aggregates from which the events occured (including it).
   */
  getEvents(from: number): Promise<StoredEvent[]>;

  /**
   * Tries to persist events.
   * Checks for OptimisticConcurrency problems.
   * If `lastStoredVersion` is not equal to
   * the version of the last event in the store then throws
   * an {@link OptimisticConcurrencyException}.
   * @param events Stream of events to be stored.
   * @param lastStoredVersion Version of the aggregate (event owner) that has been already stored.
   * @throws {OptimisticConcurrencyException}
   */
  storeEvents(events: EventsStream, lastStoredVersion: number): Promise<void>;
}

export const EVENT_STORE = Symbol.for('__EventStore__');
