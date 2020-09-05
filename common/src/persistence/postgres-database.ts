import { injectable, inject, interfaces } from 'inversify';
import { AsyncLocalStorage } from 'async_hooks';
import Knex from 'knex';
import camelCase from 'camelcase';
import decamelize from 'decamelize';
import { IDatabase, DatabaseFactory } from './database';
import { ITransaction } from './transaction';
import { DatabaseConnectionCredentials } from './connection-credentials';
import { DATABASE, LOGGER_TYPE } from '../dependency-injection';
import { ILogger } from '../utils';
import { TransactionException } from './transaction-exception';
import { TransactionId } from '../types';

const TRANSACTION_KEY = 'CURRENT_TRANSACTION';

@injectable()
export class PostgresDatabase implements IDatabase {
  /**
   * Transactions CLS (Continuation-Local Storage).
   */
  private asyncLocalStorage = new AsyncLocalStorage<Map<string, ITransaction>>();

  /**
   * Connection credentials of the database.
   */
  private connectionCredentials: DatabaseConnectionCredentials | undefined = undefined;

  /**
   * Knex instance.
   */
  private $knex: Knex | undefined = undefined;

  /**
   * Returns Knex instance or a knex `transaction` instance
   * if the current async context is running within a transaction.
   */
  get knex(): Knex {
    if (!this.$knex) throw new Error('Knex is not initialized.');
    // Check whether a CLS is defined and fetch transaction object out there
    const store = this.asyncLocalStorage.getStore() as Map<string, ITransaction>;
    const transaction = store?.get(TRANSACTION_KEY);
    return ((transaction?.trx as unknown) as Knex) ?? this.$knex;
  }

  constructor(@inject(LOGGER_TYPE) private logger: ILogger) {}

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
      const [_batchNo, log] = await this.knex.migrate.latest({ directory, extension: 'ts' });
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
      const [log] = await this.knex.seed.run({ directory, extension: 'ts' });
      log?.length === 0
        ? this.logger.info('No seed files found.')
        : this.logger.success(`√ Ran ${log.length} seed files`);
    } catch (error) {
      this.logger.failure(error, '✗ Database seeding failed');
    }
  }

  async beginTransaction(): Promise<ITransaction> {
    if (!this.$knex) throw new Error('Knex is not initialized.');
    return {
      id: TransactionId.generate(),
      trx: await this.$knex.transaction(),
    };
  }

  async commitTransaction(transaction: ITransaction): Promise<void> {
    await transaction.trx.commit();
  }

  async rollbackTransaction(transaction: ITransaction): Promise<void> {
    if (transaction.trx.isCompleted()) {
      this.logger.warn('Rollback of the transaction is rejected (it has already been completed).');
    } else {
      await transaction.trx.rollback();
    }
    this.logger.warn('Transaction rollback finished ');
  }

  async transaction<T>(runner: (transaction: ITransaction) => Promise<T>): Promise<T> {
    let transaction: ITransaction | undefined;
    try {
      transaction = await this.beginTransaction();
      // Run the transaction within a new asynchronous context.
      const res = await this.asyncLocalStorage.run(new Map<string, ITransaction>(), async () => {
        const store = this.asyncLocalStorage.getStore();
        store!.set(TRANSACTION_KEY, transaction!);
        const result = await runner(transaction!);
        await this.commitTransaction(transaction!);
        return result;
      });
      return res;
    } catch (err) {
      this.logger.error(err, 'Failed to execute database transaction');
      const error = new TransactionException(err);
      // If any exception occurred, rollback the transaction
      // so that none of the changes are persisted to the database.
      if (transaction) {
        try {
          await this.rollbackTransaction(transaction);
        } catch (e) {
          error.details = `Rollback also failed: ${e}`;
        }
      }
      // Throw the exception so it can be handled in the downstream.
      throw error;
    }
  }

  async closeConnection(): Promise<void> {
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
