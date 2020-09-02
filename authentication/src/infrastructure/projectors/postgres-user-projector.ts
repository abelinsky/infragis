import { inject, injectable } from 'inversify';
import {
  AuthenticationEvents,
  ProjectionHandler,
  StoredEvent,
  PostgresDomesticProjector,
  PostgresDatabase,
  ILogger,
  EventStoreFactory,
  DATABASE,
  LOGGER_TYPE,
  EVENT_STORE_FACTORY,
  EventName,
} from '@infragis/common';
import { User } from '@/domain';

@injectable()
export class PostgresUserProjector extends PostgresDomesticProjector {
  groupId = 'user_projector';

  private eventStore = this.eventStoreFactory('user_events');

  constructor(
    @inject(DATABASE) protected database: PostgresDatabase,
    @inject(EVENT_STORE_FACTORY) private eventStoreFactory: EventStoreFactory,
    @inject(LOGGER_TYPE) logger: ILogger
  ) {
    super();
  }

  async getEvents(after: number, topic: string): Promise<StoredEvent[]> {
    // we are listening only for one topic here, so we do not need switch/case for response.
    // But it worth to check that the topic is right.
    if (!this.getTopics().includes(topic)) {
      throw new Error(
        `PostgresUserProjector is strangely requested about the topic \"${topic}\" while it is not interested in it.`
      );
    }

    return await this.eventStore.getAllEvents(after);
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
  async onUserCreated({ aggregateId, data }: StoredEvent<AuthenticationEvents.UserCreatedData>) {
    this.logger.info(`Received in InMemoryUserProjector: ${JSON.stringify(data)}`);

    const userDocument = {
      id: aggregateId,
    };

    this.logger.warn('TODO: Implement projection store in PostgresUserProjector');

    //this.usersStore.set(data.email, userDocument);
  }
}
