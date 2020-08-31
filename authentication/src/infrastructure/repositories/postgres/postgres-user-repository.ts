import { User, UserRepository } from '@/domain';
import { IN_MEMORY_USERS_STORE } from '@/infrastructure/constants';
import {
  InMemoryStore,
  UserId,
  EVENT_STORE_FACTORY,
  EventStoreFactory,
  SNAPSHOT_STORE_FACTORY,
  SnapshotStoreFactory,
} from '@infragis/common';
import { inject, injectable } from 'inversify';

@injectable()
export class PostgresUserRepository implements UserRepository {
  /**
   * Specifies the interval between saving a snapshot. This helps not to save snapshots often, because we can alway
   * get some snapshot and events after it and replay them to get the actual state of the aggregate.
   */
  private readonly snapshotStoreInterval = 50;

  private eventStore = this.eventStoreFactory('user_events');
  private snapshotStore = this.snapshotStoreFactory('user_snapshots');

  constructor(
    @inject(EVENT_STORE_FACTORY) private eventStoreFactory: EventStoreFactory,
    @inject(SNAPSHOT_STORE_FACTORY) private snapshotStoreFactory: SnapshotStoreFactory,
    // TODO: Replace with PostgresStore
    @inject(IN_MEMORY_USERS_STORE) private usersStore: InMemoryStore
  ) {}

  async getId(email: string): Promise<UserId> {
    const document = this.usersStore.get(email);
    return document ? UserId.fromString(document.id) : undefined;
  }

  async store(user: User): Promise<void> {
    await this.eventStore.storeEvents(user.resetEvents(), user.persistedAggregateVersion);
    const snapshot = await this.snapshotStore.get(user.aggregateId);
    if (
      !snapshot ||
      user.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval
    ) {
      await this.snapshotStore.store(user.snapshot);
    }
  }
}
