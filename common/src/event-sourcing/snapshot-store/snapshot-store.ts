import { Id } from '../../types';
import { StoredSnapshot } from '../core/stored-snapshot';

export interface SnapshotStore<T = any> {
  getSnapshot(id: Id): Promise<StoredSnapshot<T> | undefined>;
  storeSnapshot(snapshot: StoredSnapshot<T>): Promise<void>;
}
