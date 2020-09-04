import assert from 'assert';
import { injectable, inject, interfaces } from 'inversify';
import camelCase from 'camelcase';
import decamelize from 'decamelize';
import Knex from 'knex';
import { IDatabase, DatabaseFactory } from './database';
import { DatabaseConnectionCredentials } from './connection-credentials';
import { DATABASE, LOGGER_TYPE } from '../dependency-injection';
import { ILogger } from '../utils';
import { TransactionException } from './transaction-exception';

@injectable()
export class PostgresDatabase implements IDatabase {
  private connectionCredentials: DatabaseConnectionCredentials | undefined = undefined;

  private $knex: Knex | undefined = undefined;

  /**
   * Current running transaction that is started by {@link PostgresDatabase#beginTransaction} method.
   */
  private _transaction: Knex.Transaction | undefined = undefined;

  constructor(@inject(LOGGER_TYPE) private logger: ILogger) {}

  get knex() {
    if (!this.$knex) {
      throw new Error(
        'Knex in PostgresDatabase is not initialized. Probably, PostgresDatabase#initialize() was not called.'
      );
    }
    return this._transaction ?? this.$knex;
  }

  initialize(credentials: DatabaseConnectionCredentials) {
    if (this.$knex) return; // Already initialized in a Singleton scope, no need to re-initialize.

    this.connectionCredentials = credentials;

    this.$knex = Knex({
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
        min: 2,
        max: 10,
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

  async beginTransaction(): Promise<void> {
    this.logger.debug('Beginning transaction');

    assert(
      !this._transaction,
      'A new transaction could not be started while another transaction is being executed.'
    );
    assert(
      this.$knex,
      'Knex in PostgresDatabase is not initialized. Probably, PostgresDatabase#initialize() was not called.'
    );

    // const trxProvider = this.$knex.transactionProvider();
    // this._transaction = await trxProvider();
    this._transaction = await this.$knex.transaction();

    this.logger.debug('Began!');
  }

  async commitTransaction(): Promise<void> {
    this.logger.debug('Comitting transaction');

    assert(
      this._transaction,
      'An error occurred in commitTransaction() method: `transaction` is undefined '
    );
    const promise = this._transaction.commit();
    this._transaction = undefined;
    await promise;

    this.logger.debug('Comitted!');
  }

  async rollbackTransaction(): Promise<void> {
    this.logger.debug('Rolling back.');

    assert(
      this._transaction,
      'An error occurred in rollbackTransaction(): `transaction` is undefined '
    );
    if (this._transaction.isCompleted()) {
      this.logger.warn(
        'The request to rollback the transaction is rejected because the transaction has already been completed.'
      );
    } else {
      await this._transaction.rollback();
      this.logger.warn('Transaction rollback finished ');
    }
    this._transaction = undefined;

    this.logger.debug('Rolled back!');
  }

  async transaction<T>(runner: () => Promise<T>): Promise<T> {
    // Begin transaction
    await this.beginTransaction();

    // Execute runner within a try / catch block
    try {
      this.logger.debug('Starting runner');
      const result = await runner();
      this.logger.debug('Ran!');
      await this.commitTransaction();
      return result;
    } catch (error) {
      this.logger.error(error, 'Failed to execute database transaction');
      // If any exception occurred, rollback the transaction
      // so that none of the changes are persisted to the database.
      await this.rollbackTransaction();
      // Throw the exception so it can be handled in the downstream.
      throw new TransactionException(error);
    }
  }

  async closeConnection(): Promise<void> {
    // Commit transaction if any
    if (this._transaction) {
      await this.commitTransaction();
    }
    // Release connection
    await this.$knex?.destroy();
    this.$knex = undefined;
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
