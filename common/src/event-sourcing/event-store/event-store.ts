import { EventsStream } from '../core/events-stream';
import { StoredEvent } from '../core/stored-event';

export interface EventStore {
  /**
   * Gets an array of {@link StoredEvent} from the specified aggregate
   * that occured after the specified version of the aggregate.
   * @param aggregateId Id of the aggregate under request.
   * @param after The sequence number of the last event.
   */
  getEventsStream(aggregateId: string, after?: number): Promise<StoredEvent[]>;

  /**
   * Gets events after the specified version.
   * @param after Version of the aggregates after which the events occured
   *     (not including `after` => greater than @param `after`).
   */
  getAllEvents(after: number): Promise<StoredEvent[]>;

  /**
   * Tries to persist events.
   * Checks for OptimisticConcurrency problems.
   * If `expectedVersion` is not equal to
   * the version of the last event in the store then throws
   * an {@link OptimisticConcurrencyException}.
   * @param events Stream of events to be stored.
   * @param expectedVersion Version of the aggregate (event owner) that has been
   *     already stored.
   * @throws {OptimisticConcurrencyException}
   */
  storeEvents(events: EventsStream, expectedVersion: number): Promise<void>;
}
