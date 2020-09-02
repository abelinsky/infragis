import { injectable, inject, interfaces } from 'inversify';
import camelCase from 'camelcase';
import decamelize from 'decamelize';
import Knex from 'knex';
import { IDatabase, DatabaseFactory } from './database';
import { DatabaseConnectionCredentials } from './connection-credentials';
import { DATABASE, LOGGER_TYPE } from '../dependency-injection';
import { ILogger } from '../utils';

@injectable()
export class PostgresDatabase implements IDatabase {
  private connectionCredentials: DatabaseConnectionCredentials | undefined = undefined;

  private _knex: Knex | undefined = undefined;

  constructor(@inject(LOGGER_TYPE) private logger: ILogger) {}

  get knex() {
    if (!this._knex) {
      throw new Error(
        'Knex in PostgresDatabase is not initialized. Probably, PostgresDatabase#initialize() was not called.'
      );
    }

    // TODO: ensure connection ?
    // await asyncRetry(() => this.xxx?.connect());

    return this._knex;
  }

  initialize(credentials: DatabaseConnectionCredentials) {
    if (this._knex) return; // Already initialized in a Singleton scope, no need to re-initialize.

    this.connectionCredentials = credentials;

    this._knex = Knex({
      // debug: true,
      client: 'pg',
      connection: {
        host: credentials.databaseHost,
        port: credentials.databasePort,
        user: credentials.databaseUser,
        password: credentials.databasePassword,
        database: credentials.databaseName,
      },
      pool: {
        afterCreate: (_conn: any, done: (...args: any[]) => any) => {
          this.logger.success(
            `√ The connection to Postgres database \"${credentials.databaseName}\" is established.`
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

  async migrate(directory: string): Promise<void> {
    this.logger.info('Performing database migrations ...');

    try {
      const [_batchNo, log] = await this.knex.migrate.latest({
        directory,
        extension: 'ts',
      });

      this.logger.success(
        log?.length === 0 ? 'Already up to date' : `√ ${log.length} migration(s) done.`
      );
    } catch (error) {
      this.logger.failure(error, '✗ Database migrations failed');
    }
  }

  async seed(directory: string): Promise<void> {
    this.logger.info('Seeding database ...');
    try {
      const [log] = await this.knex.seed.run({
        directory,
        extension: 'ts',
      });

      log?.length === 0
        ? this.logger.info('No seed files found.')
        : this.logger.success(`√ Ran ${log.length} seed files`);
    } catch (error) {
      this.logger.failure(error, '✗ Database seeding failed');
    }
  }

  async closeConnection(): Promise<void> {
    await this._knex?.destroy();
    this._knex = undefined;
  }
}

/**
 * Returns factory for creating and initializing {@link PostgresDatabase} instance.
 * @param context Inversify context.
 */
export const postgresDatabaseFactory = (context: interfaces.Context): DatabaseFactory => {
  return (connectionCredentials) => {
    const database = context.container.get(DATABASE);
    if (!(database instanceof PostgresDatabase)) {
      throw new Error(
        'Cannot apply PostgresDatabaseFactory because DATABASE identifier is not binded for PostgresDatabase'
      );
    }
    database.initialize(connectionCredentials);
    return database;
  };
};
