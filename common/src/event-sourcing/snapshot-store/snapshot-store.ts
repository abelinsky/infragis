import { Id } from '../../types';
import { StoredSnapshot } from '../core/stored-snapshot';

export interface SnapshotStore<T = any> {
  get(aggregateId: Id): Promise<StoredSnapshot<T> | undefined>;
  store(snapshot: StoredSnapshot<T>): Promise<void>;
}
