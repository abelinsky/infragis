import { inject, injectable } from 'inversify';
import {
  ILogger,
  InMemoryEventStore,
  InMemorySnaphotStore,
  LOGGER_TYPE,
  UserId,
  InMemoryStore,
} from '@infragis/common';
import { User } from '@/domain';
import { UserRepository } from '@/domain';
import { IN_MEMORY_USERS_STORE } from '@/infrastructure/constants';

@injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly snapshotStoreInterval = 50;

  constructor(
    @inject(InMemoryEventStore) private eventStore: InMemoryEventStore,
    @inject(InMemorySnaphotStore) private snapshotStore: InMemorySnaphotStore,
    @inject(IN_MEMORY_USERS_STORE) private usersStore: InMemoryStore,
    @inject(LOGGER_TYPE)
    private logger: ILogger
  ) {}

  async getId(email: string): Promise<UserId | undefined> {
    const document = this.usersStore.get(email);
    return document ? UserId.fromString(document.id) : undefined;
  }

  async store(user: User): Promise<void> {
    await this.eventStore.storeEvents(user.resetEvents(), user.persistedAggregateVersion);

    const snapshot = await this.snapshotStore.getSnapshot(user.aggregateId);
    if (user.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval) {
      await this.snapshotStore.storeSnapshot(user.snapshot);
    }

    this.logger.info('Stored in Users Event');
    (await this.eventStore.getAllEvents(0)).forEach((e) =>
      this.logger.info(`${JSON.stringify(e)}`)
    );
  }
}
