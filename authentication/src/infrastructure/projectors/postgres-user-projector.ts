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
} from '@infragis/common';
import { User } from '@/domain';

@injectable()
export class PostgresUserProjector extends PostgresDomesticProjector {
  projectorName = 'postgres_user_projector';
  aggregateClass = User;

  private eventStore = this.eventStoreFactory('user_events');

  constructor(@inject(EVENT_STORE_FACTORY) private eventStoreFactory: EventStoreFactory) {
    super();
  }

  @inject(DATABASE) database: PostgresDatabase;
  @inject(LOGGER_TYPE) logger: ILogger;

  async getEvents(after: number): Promise<StoredEvent[]> {
    return await this.eventStore.getAllEvents(after);
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
  async created({ aggregateId, data }: StoredEvent<AuthenticationEvents.UserCreatedData>) {
    this.logger.info(`Received in InMemoryUserProjector: ${JSON.stringify(data)}`);

    const userDocument = {
      id: aggregateId,
    };

    this.logger.warn('TODO: Implement projection store in PostgresUserProjector');

    //this.usersStore.set(data.email, userDocument);
  }
}
