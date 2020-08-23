import { SnapshotStore } from './snapshot-store';
import { StoredSnapshot } from '../core/stored-snapshot';

export class PostgresSnapshotStore<T = any> implements SnapshotStore<T> {
  getSnapshot(id: any): Promise<StoredSnapshot<T> | undefined> {
    throw new Error('Method not implemented.');
  }
  storeSnapshot(snapshot: StoredSnapshot<T>): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
