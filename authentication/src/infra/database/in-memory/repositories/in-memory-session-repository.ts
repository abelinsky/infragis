import { Session } from '@/domain';
import { SessionRepository } from '@/domain/repositories';
import { inject, injectable } from 'inversify';
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
export class InMemorySessionRepository implements SessionRepository {
  private readonly snapshotStoreInterval = 50;

  // TODO: Fix topics
  private eventStore: InMemoryEventStore = this.eventStoreFactory({
    topic: 'Sessions',
  });
  private snapshotStore: InMemorySnaphotStore = this.snaphotStoreFactory();

  constructor(
    @inject(IN_MEMORY_EVENT_STORE_FACTORY) private eventStoreFactory: InMemoryEventStoreFactory,
    @inject(IN_MEMORY_SNAPSHOT_STORE_FACTORY)
    private snaphotStoreFactory: InMemorySnapshotStoreFactory,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {}

  async store(session: Session): Promise<void> {
    await this.eventStore.storeEvents(session.resetEvents(), session.persistedAggregateVersion);

    const snapshot = await this.snapshotStore.getSnapshot(session.aggregateId);
    if (session.aggregateVersion - (snapshot?.version || 0) > this.snapshotStoreInterval) {
      await this.snapshotStore.storeSnapshot(session.snapshot);
    }

    this.logger.info('Stored in Sessions Event');
    (await this.eventStore.getEvents(0)).forEach((e) => this.logger.info(`${JSON.stringify(e)}`));
  }
}
