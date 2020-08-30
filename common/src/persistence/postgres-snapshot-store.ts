import { injectable, inject, interfaces } from 'inversify';
import camelCase from 'camelcase';
import decamelize from 'decamelize';
import Knex from 'knex';
import { SnapshotStore, StoredSnapshot } from '../event-sourcing';
import { Id } from '../types';
import { ILogger } from '../utils';
import { LOGGER_TYPE, SNAPSHOT_STORE } from '../dependency-injection';
import { PostgresConnectionConfig } from './postgres-connection-config';

@injectable()
export class PostgresSnapshotStore<T = any> implements SnapshotStore<T> {
  constructor(@inject(LOGGER_TYPE) protected logger: ILogger) {}

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

  Snapshots = () => {
    if (!this.knex) {
      throw new Error(
        `Knex is not initialized. Probably, initialize() was not called for ${this.constructor.name}`
      );
    }
    return this.knex<StoredSnapshot>(this.config?.tableName);
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

  async get(aggregateId: Id): Promise<StoredSnapshot<T> | undefined> {
    const result = await this.Snapshots()
      .select()
      .where('aggregateId', aggregateId.toString())
      .orderBy('version', 'desc')
      .first();
    return result;
  }

  async store(snapshot: StoredSnapshot<T>): Promise<void> {
    await this.Snapshots().insert(snapshot);
  }
}

export type PostgresSnapshotStoreFactory = (
  config: PostgresConnectionConfig
) => PostgresSnapshotStore;

export const postgresSnapshotStoreFactory = (
  context: interfaces.Context
): PostgresSnapshotStoreFactory => {
  return (config: PostgresConnectionConfig) => {
    const store = context.container.get(SNAPSHOT_STORE);
    if (!(store instanceof PostgresSnapshotStore)) {
      throw new Error(
        'Cannot find appropriate binding for SNAPSHOT_STORE identifier. Probably, you have binded it to a class that is not assignable to PostgresSnapshotStore or have not binded it at all.'
      );
    }
    store.initialize(config);
    return store;
  };
};
