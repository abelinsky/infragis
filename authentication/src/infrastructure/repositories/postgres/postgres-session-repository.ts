import { Session, SessionRepository } from '@/domain';
import { AUTHENTICATION_CONFIG } from '@/main/config';
import {
  EVENT_STORE_FACTORY,
  IConfig,
  PostgresEventStoreFactory,
  PostgresSnapshotStoreFactory,
  SECRETS_CONFIG,
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

  private readonly connectionCredentials = {
    databaseHost: this.config.get('authentication.database.host'),
    databasePort: this.config.getNumber('authentication.database.port'),
    databaseName: this.config.get('authentication.database.name'),
    databaseUser: this.secretsConfig.get('secrets.authentication-database.user'),
    databasePassword: this.secretsConfig.get('secrets.authentication-database.password'),
  };

  private eventStore = this.eventStoreFactory({
    ...this.connectionCredentials,
    tableName: 'session_events',
  });

  private snapshotStore = this.snapshotStoreFactory({
    ...this.connectionCredentials,
    tableName: 'session_snapshots',
  });

  constructor(
    @inject(AUTHENTICATION_CONFIG) private config: IConfig,
    @inject(SECRETS_CONFIG) private secretsConfig: IConfig,
    @inject(EVENT_STORE_FACTORY) private eventStoreFactory: PostgresEventStoreFactory,
    @inject(SNAPSHOT_STORE_FACTORY) private snapshotStoreFactory: PostgresSnapshotStoreFactory
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
