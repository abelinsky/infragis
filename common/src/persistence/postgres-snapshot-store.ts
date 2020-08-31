import { injectable, inject, interfaces } from 'inversify';
import { SnapshotStore, StoredSnapshot, SnapshotStoreFactory } from '../event-sourcing';
import { Id } from '../types';
import { ILogger } from '../utils';
import { LOGGER_TYPE, SNAPSHOT_STORE, DATABASE } from '../dependency-injection';
import { IDatabase } from './database';
import { PostgresDatabase } from './postgres-database';

@injectable()
export class PostgresSnapshotStore<T = any> implements SnapshotStore<T> {
  constructor(@inject(LOGGER_TYPE) protected logger: ILogger) {}

  private database!: PostgresDatabase;
  private tableName!: string;

  Snapshots = () => {
    if (!this.database) {
      throw new Error(
        `Database is not initialized. Probably, initialize() was not called for ${this.constructor.name}.`
      );
    }
    return this.database.knex<StoredSnapshot>(this.tableName);
  };

  initialize(database: PostgresDatabase, tableName: string): void {
    this.database = database;
    this.tableName = tableName;
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

export const postgresSnapshotStoreFactory = (context: interfaces.Context): SnapshotStoreFactory => {
  return (snapshotStoreFactory: string, database?: IDatabase) => {
    if (!database) {
      database = context.container.get(DATABASE);
    }
    if (!(database instanceof PostgresDatabase)) {
      throw new Error(
        'Cannot assign PostgresEventStoreFactory to unknown Database (not PostgresDatabase) in postgresEventStoreFactory.'
      );
    }
    const store = context.container.get(SNAPSHOT_STORE);
    if (!(store instanceof PostgresSnapshotStore)) {
      throw new Error(
        'Cannot find appropriate binding for SNAPSHOT_STORE identifier. Probably, you have binded it to a class that is not assignable to PostgresSnapshotStore or have not binded it at all.'
      );
    }
    store.initialize(database, snapshotStoreFactory);
    return store;
  };
};
