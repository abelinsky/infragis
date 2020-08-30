import {Session} from '@/domain';
import {SessionRepository} from '@/domain';
import {InMemoryEventStore, InMemorySnaphotStore} from '@infragis/common';
import {inject, injectable} from 'inversify';

/**
 * Used mainly for testing purposes. Actual Repository implementation is in
 * `postgres` module.
 */
@injectable()
export class InMemorySessionRepository implements SessionRepository {
  private readonly snapshotStoreInterval = 50;

  constructor(
      @inject(InMemoryEventStore) private eventStore: InMemoryEventStore,
      @inject(InMemorySnaphotStore) private snapshotStore:
          InMemorySnaphotStore) {}

  async store(session: Session): Promise<void> {
    await this.eventStore.storeEvents(
      session.resetEvents(), session.persistedAggregateVersion);

    const snapshot = await this.snapshotStore.get(session.aggregateId);
    if (session.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval) {
      await this.snapshotStore.store(session.snapshot);
    }
  }
}
