import { Id } from '../types';
import { StoredSnapshot } from './stored-snapshot';

export interface SnapshotStore<T = any> {
  getSnapshot(id: Id): Promise<StoredSnapshot<T> | undefined>;
  storeSnapshot(snapshot: StoredSnapshot<T>): Promise<void>;
}

export const SNAPSHOT_STORE = Symbol.for('__SnapshotStore__');
