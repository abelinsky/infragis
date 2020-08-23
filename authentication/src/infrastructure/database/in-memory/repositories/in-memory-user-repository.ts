import { User } from '@/domain';
import { UserRepository } from '@/domain/repositories';
import { InMemoryUserProjector } from '@/infrastructure/projectors';
import {
  ILogger,
  InMemoryEventStore,
  InMemorySnaphotStore,
  IProjector,
  LOGGER_TYPE,
  StoredEvent,
  UserId,
} from '@infragis/common';
import { inject, injectable } from 'inversify';

@injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly snapshotStoreInterval = 50;

  constructor(
    @inject(InMemoryEventStore) private eventStore: InMemoryEventStore,
    @inject(InMemorySnaphotStore) private snapshotStore: InMemorySnaphotStore,
    // TODO: Fix
    @inject(InMemoryUserProjector) private userProjector: InMemoryUserProjector,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {}

  async getId(email: string): Promise<UserId | undefined> {
    const id = await this.userProjector.getId(email);
    return Promise.resolve(id);
  }

  // getEvents(from: number): Promise<StoredEvent[]> {
  //   return this.eventStore.getEvents(from);
  // }

  async userExists(email: string): Promise<boolean> {
    return this.userProjector.userExists(email);
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
