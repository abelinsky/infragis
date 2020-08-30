import { inject, injectable, interfaces } from 'inversify';
import camelCase from 'camelcase';
import decamelize from 'decamelize';
import Knex from 'knex';
import {
  EVENT_NAME_METADATA,
  EventsStream,
  EventStore,
  IDomainEventsPublisher,
  OptimisticConcurrencyException,
  StoredEvent,
} from '../event-sourcing';
import { EventId, Id, Timestamp } from '../types';
import { ILogger } from '../utils';
import { DOMAIN_EVENTS_PUBLISHER, EVENT_STORE, LOGGER_TYPE } from '../dependency-injection';
import { PostgresConnectionConfig } from './postgres-connection-config';

@injectable()
export class PostgresEventStore implements EventStore {
  constructor(
    @inject(DOMAIN_EVENTS_PUBLISHER)
    private domainEventsPublisher: IDomainEventsPublisher,
    @inject(LOGGER_TYPE) protected logger: ILogger
  ) {}

  private config: PostgresConnectionConfig | undefined = undefined;
  private _knex!: Knex;

  private get knex() {
    if (!this._knex) {
      throw new Error(
        `Knex is not initialized. Probably, initialize() was not called for ${this.constructor.name}`
      );
    }
    return this._knex;
  }

  Events = () => {
    if (!this.knex) {
      throw new Error(
        `Knex is not initialized. Probably, initialize() was not called for ${this.constructor.name}`
      );
    }
    return this.knex<StoredEvent>(this.config?.tableName);
  };

  initialize(config: PostgresConnectionConfig): void {
    this.config = config;

    this._knex = Knex({
      debug: true,
      client: 'pg',
      connection: {
        host: config.databaseHost,
        port: config.databasePort,
        user: config.databaseUser,
        password: config.databasePassword,
        database: config.databaseName,
      },
      pool: {
        afterCreate: (_conn: any, done: (...args: any[]) => any) => {
          this.logger.info(
            `The connection to Postgres database \"${config.databaseName}\" (table \"${config.tableName}\") is successfully established.`
          );
          done();
        },
      },
      postProcessResponse: (result, _queryContext) => {
        // convert to camelCase
        function mapKeysToCamelCase(obj: Record<any, any>) {
          const transformed: Record<any, any> = {};
          Object.keys(obj).forEach((key) => (transformed[camelCase(key)] = obj[key]));
          return transformed;
        }
        if (!result) return result;
        if (Array.isArray(result)) return result.map((row) => mapKeysToCamelCase(row));
        return mapKeysToCamelCase(result);
      },
      wrapIdentifier:
        // convert to snake_case
        (value: string, origImpl: (value: string) => string, queryContext: any): string =>
          origImpl(decamelize(value)),
    });
  }

  async getEventsStream(aggregateId: string, after?: number | undefined): Promise<StoredEvent[]> {
    const result = await this.Events()
      .select()
      .where('aggregateId', aggregateId)
      .andWhere('version', '>=', after ? after : 0)
      .orderBy('sequence', 'asc');
    return result;
  }

  async getAllEvents(after: number): Promise<StoredEvent[]> {
    const result = await this.Events()
      .select()
      .where('sequence', '>=', after)
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
    let currentSequence = await this.getOffset();
    const inserts = events.toArray().map((e) => {
      currentSequence++;
      const storedEvent: StoredEvent = {
        eventId: EventId.generate().toString(),
        aggregateId: events.aggregateId.toString(),
        version: e.version.toNumber(),
        name: Reflect.getMetadata(EVENT_NAME_METADATA, e.event),
        data: e.event.serialize(),
        insertedAt: Timestamp.now().toString(),
        sequence: currentSequence,
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
      .limit(1);

    return result.length ? result[0] : undefined;
  }

  private async getOffset(): Promise<number> {
    const result = await this.Events().select('*').orderBy('sequence', 'desc').limit(1);
    if (!result.length) return 0;
    return result[0].sequence;
  }
}

export type PostgresEventStoreFactory = (config: PostgresConnectionConfig) => PostgresEventStore;
export const postgresEventStoreFactory = (
  context: interfaces.Context
): PostgresEventStoreFactory => {
  return (config: PostgresConnectionConfig) => {
    const store = context.container.get(EVENT_STORE);
    if (!(store instanceof PostgresEventStore)) {
      throw new Error(
        'Cannot find appropriate binding for EVENT_STORE identifier. Probably, you"v binded it to a class that is not assignable to PostgresEventStore or have not binded it at all.'
      );
    }
    store.initialize(config);
    return store;
  };
};
