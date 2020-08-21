import { inject, injectable } from 'inversify';
import { UserRepository } from '@/domain/repositories';
import { User } from '@/domain';
import {
  IN_MEMORY_EVENT_STORE_FACTORY,
  IN_MEMORY_SNAPSHOT_STORE_FACTORY,
  InMemoryEventStoreFactory,
  InMemorySnapshotStoreFactory,
  InMemoryEventStore,
  InMemorySnaphotStore,
  LOGGER_TYPE,
  ILogger,
} from '@infragis/common';

@injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly snapshotStoreInterval = 50;

  // TODO: Fix topics
  private eventStore: InMemoryEventStore = this.eventStoreFactory({
    topic: 'Users',
  });
  private snapshotStore: InMemorySnaphotStore = this.snaphotStoreFactory();

  constructor(
    @inject(IN_MEMORY_EVENT_STORE_FACTORY) private eventStoreFactory: InMemoryEventStoreFactory,
    @inject(IN_MEMORY_SNAPSHOT_STORE_FACTORY)
    private snaphotStoreFactory: InMemorySnapshotStoreFactory,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {}

  async getByEmail(email: string): Promise<User | undefined> {
    // TODO: Fix
    return undefined;
  }

  async store(user: User): Promise<void> {
    await this.eventStore.storeEvents(user.resetEvents(), user.persistedAggregateVersion);

    const snapshot = await this.snapshotStore.getSnapshot(user.aggregateId);
    if (user.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval) {
      await this.snapshotStore.storeSnapshot(user.snapshot);
    }

    this.logger.info('Stored in Users Event');
    (await this.eventStore.getEvents(0)).forEach((e) => this.logger.info(`${JSON.stringify(e)}`));
  }
}
