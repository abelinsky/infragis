import { injectable, inject, interfaces } from 'inversify';
import camelCase from 'camelcase';
import decamelize from 'decamelize';
import Knex from 'knex';
import { IDatabase, DatabaseFactory } from './database';
import { DatabaseConnectionCredentials } from './connection-credentials';
import { DATABASE, LOGGER_TYPE } from '../dependency-injection';
import { ILogger } from '../utils';
import { v4 as uuidv4 } from 'uuid';

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
    return this._knex;
  }

  initialize(credentials: DatabaseConnectionCredentials) {
    if (this._knex) return; // Already initialized in a Singleton scope, there is no need to re-initialize.

    this.connectionCredentials = credentials;

    this._knex = Knex({
      debug: true,
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
          this.logger.info(
            `The connection to Postgres database \"${credentials.databaseName}\" is established.`
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
    this.logger.info('Hello from PostgresDatabase#migrate');
  }

  async seed(directory: string): Promise<void> {
    this.logger.info('Hello from PostgresDatabase#seed');
  }

  async closeConnection(): Promise<void> {
    this._knex = undefined;
  }
}

export const postgresDatabaseFactory = (context: interfaces.Context): DatabaseFactory => {
  return (connectionCredentials) => {
    const database = context.container.get(DATABASE);
    if (!(database instanceof PostgresDatabase)) {
      throw new Error(
        'Cannot apply PostgresDatabaseFactory because DATABASE identifir is not binded for PostgresDatabase'
      );
    }
    database.initialize(connectionCredentials);
    return database;
  };
};
