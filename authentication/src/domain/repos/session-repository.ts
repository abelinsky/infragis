import { Id, StoredSnapshot } from '@infragis/common';
import { Session } from 'inspector';

// TODO: Implement Base interface for EventStore and Snapshot Store. Make this repo as an extension of those interfaces
export interface SnapshotRepository<T> {
  get(id: Id): Promise<StoredSnapshot<T>>;
}

export const SESSION_REPOSITORY = Symbol.for('__UserRepository__');
