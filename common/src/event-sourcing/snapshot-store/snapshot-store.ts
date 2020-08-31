import { Id } from '../../types';
import { StoredSnapshot } from '../core/stored-snapshot';
import { IDatabase } from '../../persistence';

export interface SnapshotStore<T = any> {
  get(aggregateId: Id): Promise<StoredSnapshot<T> | undefined>;
  store(snapshot: StoredSnapshot<T>): Promise<void>;
}

/**
 * Type for creating SnapshotStore instance.
 * @param tableName Snapshot store table name.
 * @param database IDatabase implementation instance where to store snapshots, or default database if not defined.
 */
export type SnapshotStoreFactory = (tableName: string, database?: IDatabase) => SnapshotStore;
