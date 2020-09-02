export interface StoredEvent<T = Record<any, any>> {
  /** Unique event id (ex. UUId). */
  eventId: string;
  /** Aggregate who raised this event. */
  aggregateId: string;
  /** Aggregate version after this event had been applied. */
  version: number;
  /** Event name set by @DomainEvent decorator. */
  name: string;
  /** Payload got by serialize method of the EventClass. */
  data: T;
  /** Timestamp when this stored event was created for persistence. */
  insertedAt: string;
  /** Global sequence number of the event. */
  sequence: number;
}
