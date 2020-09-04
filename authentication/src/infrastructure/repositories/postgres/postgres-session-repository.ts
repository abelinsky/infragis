import { Session, SessionRepository } from '@/domain';
import {
  EventStoreFactory,
  SnapshotStoreFactory,
  EVENT_STORE_FACTORY,
  SNAPSHOT_STORE_FACTORY,
  LOGGER_TYPE,
  ILogger,
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
    @inject(SNAPSHOT_STORE_FACTORY) private snapshotStoreFactory: SnapshotStoreFactory,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {}

  async store(session: Session): Promise<void> {
    this.logger.debug('$tr$pre PostgresSessionRepository store(session: Session) ');

    await this.eventStore.storeEvents(session.resetEvents(), session.persistedAggregateVersion);

    this.logger.debug('$tr$post PostgresSessionRepository store(session: Session) ');

    this.logger.debug(
      '$tr$pre const snapshot = await this.snapshotStore.get(session.aggregateId); PostgresSessionRepository'
    );

    const snapshot = await this.snapshotStore.get(session.aggregateId);

    this.logger.debug(
      '$tr$post const snapshot = await this.snapshotStore.get(session.aggregateId); PostgresSessionRepository'
    );

    if (
      !snapshot ||
      session.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval
    ) {
      this.logger.debug(
        '$tr$pre PostgresSessionRepository await this.snapshotStore.store(session.snapshot);'
      );

      await this.snapshotStore.store(session.snapshot);

      this.logger.debug(
        '$tr$post PostgresSessionRepository await this.snapshotStore.store(session.snapshot);'
      );
    }
  }
}
