import { Session } from '@/domain';
import { SessionRepository } from '@/domain/repositories';
import { inject, injectable } from 'inversify';
import { InMemoryEventStore, InMemorySnaphotStore, LOGGER_TYPE, ILogger } from '@infragis/common';

@injectable()
export class InMemorySessionRepository implements SessionRepository {
  private readonly snapshotStoreInterval = 50;

  constructor(
    @inject(InMemoryEventStore) private eventStore: InMemoryEventStore,
    @inject(InMemorySnaphotStore) private snapshotStore: InMemorySnaphotStore,
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
