import { User } from '@/domain';
import { UserRepository } from '@/domain';
import { IN_MEMORY_USERS_STORE } from '@/infrastructure/constants';
import {
  InMemoryEventStore,
  InMemorySnaphotStore,
  InMemoryStore,
  UserId,
  AuthenticationQueryModel,
} from '@infragis/common';
import { inject, injectable } from 'inversify';

/**
 * Used mainly for testing purposes. Actual Repository implementation is in
 * `postgres` module.
 */
@injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly snapshotStoreInterval = 50;

  constructor(
    @inject(InMemoryEventStore) private eventStore: InMemoryEventStore,
    @inject(InMemorySnaphotStore) private snapshotStore: InMemorySnaphotStore,
    @inject(IN_MEMORY_USERS_STORE) private usersStore: InMemoryStore
  ) {}

  async getByEmail(email: string): Promise<AuthenticationQueryModel.UserView> {
    return this.usersStore.get(email);
  }

  async store(user: User): Promise<void> {
    await this.eventStore.storeEvents(user.resetEvents(), user.persistedAggregateVersion);

    const snapshot = await this.snapshotStore.get(user.aggregateId);
    if (user.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval) {
      await this.snapshotStore.store(user.snapshot);
    }
  }
}
