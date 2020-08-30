import { User, UserRepository } from '@/domain';
import { IN_MEMORY_USERS_STORE } from '@/infrastructure/constants';
import { AUTHENTICATION_CONFIG } from '@/main/config';
import {
  IConfig,
  InMemoryStore,
  SECRETS_CONFIG,
  UserId,
  EVENT_STORE_FACTORY,
  PostgresEventStoreFactory,
  SNAPSHOT_STORE_FACTORY,
  PostgresSnapshotStoreFactory,
} from '@infragis/common';
import { inject, injectable } from 'inversify';

@injectable()
export class PostgresUserRepository implements UserRepository {
  /**
   * Specifies the interval between saving a snapshot. This helps not to save snapshots often, because we can alway
   * get some snapshot and events after it and replay them to get the actual state of the aggregate.
   */
  private readonly snapshotStoreInterval = 50;

  private readonly connectionCredentials = {
    databaseHost: this.config.get('authentication.database.host'),
    databasePort: this.config.getNumber('authentication.database.port'),
    databaseName: this.config.get('authentication.database.name'),
    databaseUser: this.secretsConfig.get('secrets.authentication-database.user'),
    databasePassword: this.secretsConfig.get('secrets.authentication-database.password'),
  };

  private eventStore = this.eventStoreFactory({
    ...this.connectionCredentials,
    tableName: 'user_events',
  });

  private snapshotStore = this.snapshotStoreFactory({
    ...this.connectionCredentials,
    tableName: 'user_snapshots',
  });

  constructor(
    @inject(AUTHENTICATION_CONFIG) private config: IConfig,
    @inject(SECRETS_CONFIG) private secretsConfig: IConfig,
    @inject(EVENT_STORE_FACTORY) private eventStoreFactory: PostgresEventStoreFactory,
    @inject(SNAPSHOT_STORE_FACTORY) private snapshotStoreFactory: PostgresSnapshotStoreFactory,

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
