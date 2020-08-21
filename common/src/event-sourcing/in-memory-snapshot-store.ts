import { interfaces, injectable } from 'inversify';
import { SnapshotStore } from './snapshot-store';
import { StoredSnapshot } from './stored-snapshot';
import { Id } from '../types';

@injectable()
export class InMemorySnaphotStore implements SnapshotStore {
  private snapshots: Record<string, StoredSnapshot> = {};

  async getSnapshot(id: Id): Promise<StoredSnapshot | undefined> {
    return this.snapshots[id.toString()];
  }

  async storeSnapshot(snapshot: StoredSnapshot): Promise<void> {
    this.snapshots[snapshot.aggregateId] = snapshot;
  }
}

export type InMemorySnapshotStoreFactory = () => InMemorySnaphotStore;

export const inMemorySnapshotStoreFactory = (
  context: interfaces.Context
): InMemorySnapshotStoreFactory => () => context.container.get(InMemorySnaphotStore);
