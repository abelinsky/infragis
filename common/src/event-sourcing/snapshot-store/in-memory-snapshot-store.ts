import { injectable } from 'inversify';

import { Id } from '../../types';
import { StoredSnapshot } from '../core/stored-snapshot';

import { SnapshotStore } from './snapshot-store';

@injectable()
export class InMemorySnaphotStore implements SnapshotStore {
  private snapshots: Record<string, StoredSnapshot> = {};

  async get(id: Id): Promise<StoredSnapshot | undefined> {
    return this.snapshots[id.toString()];
  }

  async store(snapshot: StoredSnapshot): Promise<void> {
    this.snapshots[snapshot.aggregateId] = snapshot;
  }
}
