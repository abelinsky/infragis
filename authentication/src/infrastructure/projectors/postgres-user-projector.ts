import { inject, injectable } from 'inversify';
import {
  AuthenticationEvents,
  AuthenticationQueryModel,
  ProjectionHandler,
  StoredEvent,
  PostgresDomesticProjector,
  PostgresDatabase,
  ILogger,
  EventStoreFactory,
  EventName,
  DATABASE,
  LOGGER_TYPE,
  EVENT_STORE_FACTORY,
} from '@infragis/common';

@injectable()
export class PostgresUserProjector extends PostgresDomesticProjector {
  groupId = 'user_projector';

  private userEventStore = this.eventStoreFactory('user_events');
  private sessionEventStore = this.eventStoreFactory('session_events');

  private UserView = () => this.database.knex<AuthenticationQueryModel.UserView>('user_view');

  constructor(
    @inject(DATABASE) protected database: PostgresDatabase,
    @inject(EVENT_STORE_FACTORY) private eventStoreFactory: EventStoreFactory,
    @inject(LOGGER_TYPE) logger: ILogger
  ) {
    super();
  }

  async getEvents(after: number, topic: string): Promise<StoredEvent[]> {
    switch (topic) {
    // TODO: Replace with someting like Topics.AuthenticationUser
    case EventName.fromString(AuthenticationEvents.EventNames.UserCreated).getTopic():
      return await this.userEventStore.getAllEvents(after);
    case EventName.fromString(AuthenticationEvents.EventNames.SignUpRequested).getTopic():
      return await this.sessionEventStore.getAllEvents(after);
    default:
      throw new Error(
        'PostgresUserProjector is strangely requested about the topic "${topic}" while it is not interested in it.'
      );
    }
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
  async onUserCreated({ aggregateId, data }: StoredEvent<AuthenticationEvents.UserCreatedData>) {
    await this.UserView().insert({
      userId: aggregateId,
      createdAt: data.createdAt,
      email: data.email,
      sessionId: undefined,
    });
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.SignUpRequested)
  async onSignUpRequested({ data }: StoredEvent<AuthenticationEvents.SignUpRequestedData>) {
    await this.UserView().where({ userId: data.userId }).update({ sessionId: data.sessionId });
  }
}
