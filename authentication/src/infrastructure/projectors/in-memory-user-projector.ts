import {SerializedUser, User} from '@/domain';
import {USER_REPOSITORY, UserRepository} from '@/domain/repositories';
import {Aggregate, AuthenticationEvents, DomesticMemoryProjector, ILogger, InMemoryEventStore, LOGGER_TYPE, ProjectionHandler, StoredEvent, UserId,} from '@infragis/common';
import {inject, injectable, postConstruct} from 'inversify';

@injectable()
export class InMemoryUserProjector extends DomesticMemoryProjector {
  // TODO: logger is private in Projector?!
  @inject(LOGGER_TYPE) logging: ILogger;

  // TODO: aggregateClass = User does not work
  aggregateClass: typeof Aggregate|undefined = undefined;

  @inject(InMemoryEventStore) private eventStore: InMemoryEventStore;

  getEvents(from: number): Promise<StoredEvent[]> {
    return this.eventStore.getEvents(from);
  }

  async userExists(email: string): Promise<boolean> {
    return !!this.projection[email];
  }

  async getId(email: string): Promise<UserId|undefined> {
    await this.replay();
    if (!this.projection[email]) return undefined;
    return Promise.resolve(UserId.fromString(this.projection[email].id));
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
  async created({aggregateId,
                 data}: StoredEvent<AuthenticationEvents.UserCreatedData>) {
    this.logging.info(
        `Received in InMemoryUserProjector: ${JSON.stringify(data)}`);

    const userDocument = {
      id: aggregateId,
    };
    this.projection = {...this.projection, [data.email]: userDocument};
  }
}
