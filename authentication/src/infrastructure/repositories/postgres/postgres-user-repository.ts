import { User, UserRepository } from '@/domain';
import {
  AuthenticationQueryModel,
  EventStoreFactory,
  SnapshotStoreFactory,
  PostgresDatabase,
  EVENT_STORE_FACTORY,
  SNAPSHOT_STORE_FACTORY,
  DATABASE,
  LOGGER_TYPE,
  ILogger,
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
  private UserView = () => this.database.knex<AuthenticationQueryModel.UserView>('user_view');

  constructor(
    @inject(DATABASE) private database: PostgresDatabase,
    @inject(EVENT_STORE_FACTORY) private eventStoreFactory: EventStoreFactory,
    @inject(SNAPSHOT_STORE_FACTORY) private snapshotStoreFactory: SnapshotStoreFactory,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {}

  async getByEmail(email: string): Promise<AuthenticationQueryModel.UserView | undefined> {
    return await this.UserView().select().where({ email }).first();
  }

  async store(user: User): Promise<void> {
    await this.eventStore.storeEvents(user.resetEvents(), user.persistedAggregateVersion);

    this.logger.debug('$tr$post PostgresUserRepository await this.eventStore.storeEvents');

    this.logger.debug(
      '$tr$pre PostgresUserRepository const snapshot = await this.snapshotStore.get(user.aggregateId);'
    );

    const snapshot = await this.snapshotStore.get(user.aggregateId);

    this.logger.debug(
      '$tr$post PostgresUserRepository const snapshot = await this.snapshotStore.get(user.aggregateId);'
    );

    if (
      !snapshot ||
      user.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval
    ) {
      this.logger.debug(
        '$tr$pre PostgresUserRepository await this.snapshotStore.store(user.snapshot);'
      );

      await this.snapshotStore.store(user.snapshot);

      this.logger.debug(
        '$tr$post PostgresUserRepository await this.snapshotStore.store(user.snapshot);'
      );
    }
  }
}
