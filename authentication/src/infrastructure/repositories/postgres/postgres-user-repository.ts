import { User, UserRepository } from '@/domain';
import { IN_MEMORY_USERS_STORE } from '@/infrastructure/constants';
import { AUTHENTICATION_CONFIG, AuthenticationConfig } from '@/main/config';
import {
  EVENT_STORE_FACTORY,
  IConfig,
  ILogger,
  InMemorySnaphotStore,
  InMemoryStore,
  LOGGER_TYPE,
  PostgresEventStoreFactory,
  SECRETS_CONFIG,
  UserId,
} from '@infragis/common';
import { inject, injectable } from 'inversify';

@injectable()
export class PostgresUserRepository implements UserRepository {
  private readonly snapshotStoreInterval = 50;

  private eventStore = this.postgresEventStoreFactory({
    databaseHost: this.config.get('authentication.database.host'),
    databasePort: this.config.getNumber('authentication.database.port'),
    databaseName: this.config.get('authentication.database.name'),
    tableName: 'user_events',
    databaseUser: this.secretsConfig.get('secrets.authentication-database.user'),
    databasePassword: this.secretsConfig.get('secrets.authentication-database.password'),
  });

  constructor(
    @inject(EVENT_STORE_FACTORY) private postgresEventStoreFactory: PostgresEventStoreFactory,
    @inject(AUTHENTICATION_CONFIG) private config: IConfig,
    @inject(SECRETS_CONFIG) private secretsConfig: IConfig,
    @inject(LOGGER_TYPE) private logger: ILogger,

    // TODO: Replace with PostgresStore
    @inject(InMemorySnaphotStore) private snapshotStore: InMemorySnaphotStore,
    @inject(IN_MEMORY_USERS_STORE) private usersStore: InMemoryStore
  ) {}

  async getId(email: string): Promise<UserId> {
    const document = this.usersStore.get(email);
    return document ? UserId.fromString(document.id) : undefined;
  }

  async store(user: User): Promise<void> {
    await this.eventStore.storeEvents(user.resetEvents(), user.persistedAggregateVersion);
    const snapshot = await this.snapshotStore.getSnapshot(user.aggregateId);
    if (user.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval) {
      await this.snapshotStore.storeSnapshot(user.snapshot);
    }
  }
}
