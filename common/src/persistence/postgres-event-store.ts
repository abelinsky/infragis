import { inject, injectable, interfaces } from 'inversify';
import {
  EVENT_NAME_METADATA,
  EventsStream,
  EventStore,
  EventStoreFactory,
  IDomainEventsPublisher,
  OptimisticConcurrencyException,
  StoredEvent,
} from '../event-sourcing';
import { EventId, Id, Timestamp } from '../types';
import { ILogger } from '../utils';
import {
  DOMAIN_EVENTS_PUBLISHER,
  EVENT_STORE,
  LOGGER_TYPE,
  DATABASE,
} from '../dependency-injection';
import { IDatabase } from './database';
import { PostgresDatabase } from './postgres-database';

@injectable()
export class PostgresEventStore implements EventStore {
  constructor(
    @inject(DOMAIN_EVENTS_PUBLISHER)
    private domainEventsPublisher: IDomainEventsPublisher,
    @inject(LOGGER_TYPE) protected logger: ILogger
  ) {}

  private database!: PostgresDatabase;
  private tableName!: string;

  Events = () => {
    if (!this.database) {
      throw new Error(
        `Database is not initialized. Probably, initialize() was not called for ${this.constructor.name}.`
      );
    }
    return this.database.knex<StoredEvent>(this.tableName);
  };

  initialize(database: PostgresDatabase, tableName: string): void {
    this.database = database;
    this.tableName = tableName;
  }

  async getEventsStream(aggregateId: string, after?: number | undefined): Promise<StoredEvent[]> {
    const result = await this.Events()
      .select()
      .where('aggregateId', aggregateId)
      .andWhere('version', '>', after ? after : 0)
      .orderBy('sequence', 'asc');
    return result;
  }

  async getAllEvents(after: number): Promise<StoredEvent[]> {
    const result = await this.Events()
      .select()
      .where('sequence', '>', after) // do not include event with sequence === `after`
      .orderBy('sequence', 'asc');
    return result;
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

    // Create StoredEvent list
    let offset = await this.getOffset();
    const inserts = events.toArray().map((e) => {
      offset++;
      const storedEvent: StoredEvent = {
        eventId: EventId.generate().toString(),
        aggregateId: events.aggregateId.toString(),
        version: e.version.toNumber(),
        name: Reflect.getMetadata(EVENT_NAME_METADATA, e.event),
        data: e.event.serialize(),
        insertedAt: Timestamp.now().toString(),
        sequence: offset,
      };
      return storedEvent;
    });

    // Persist `inserts`
    await this.Events().insert(inserts);

    // Publish domain events events
    this.domainEventsPublisher.publish(inserts);
  }

  private async getLastEvent(aggregateId: Id): Promise<StoredEvent | undefined> {
    const result = await this.Events()
      .select('*')
      .where('aggregateId', aggregateId.toString())
      .orderBy('version')
      .first();
    return result;
  }

  private async getOffset(): Promise<number> {
    const result = await this.Events().select().orderBy('sequence', 'desc').first();
    return result?.sequence ?? 0;
  }
}

export const postgresEventStoreFactory = (context: interfaces.Context): EventStoreFactory => {
  return (eventStoreTableName: string, database?: IDatabase) => {
    if (!database) {
      database = context.container.get(DATABASE);
    }
    if (!(database instanceof PostgresDatabase)) {
      throw new Error(
        'Cannot assign PostgresEventStoreFactory to unknown Database (not PostgresDatabase) in postgresEventStoreFactory.'
      );
    }
    const store = context.container.get(EVENT_STORE);
    if (!(store instanceof PostgresEventStore)) {
      throw new Error(
        'Cannot find appropriate binding for EVENT_STORE identifier. Probably, you"v binded it to a class that is not assignable to PostgresEventStore or have not binded it at all.'
      );
    }
    store.initialize(database, eventStoreTableName);
    return store;
  };
};
