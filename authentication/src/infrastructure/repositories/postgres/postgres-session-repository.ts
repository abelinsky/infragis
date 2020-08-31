import { Session, SessionRepository } from '@/domain';
import {
  EventStoreFactory,
  SnapshotStoreFactory,
  EVENT_STORE_FACTORY,
  SNAPSHOT_STORE_FACTORY,
} from '@infragis/common';
import { inject, injectable } from 'inversify';

@injectable()
export class PostgresSessionRepository implements SessionRepository {
  /**
   * Specifies the interval between saving a snapshot. This helps not to save
   * snapshots often, because we can alway get some snapshot and events after it
   * and replay them to get the actual state of the aggregate.
   */
  private readonly snapshotStoreInterval = 50;

  private eventStore = this.eventStoreFactory('session_events');
  private snapshotStore = this.snapshotStoreFactory('session_snapshots');

  constructor(
    @inject(EVENT_STORE_FACTORY)
    private eventStoreFactory: EventStoreFactory,
    @inject(SNAPSHOT_STORE_FACTORY) private snapshotStoreFactory: SnapshotStoreFactory
  ) {}

  async store(session: Session): Promise<void> {
    await this.eventStore.storeEvents(session.resetEvents(), session.persistedAggregateVersion);
    const snapshot = await this.snapshotStore.get(session.aggregateId);
    if (
      !snapshot ||
      session.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval
    ) {
      await this.snapshotStore.store(session.snapshot);
    }
  }
}
