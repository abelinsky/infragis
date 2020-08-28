import { inject, injectable, postConstruct } from 'inversify';
import { Class } from 'utility-types';
import {
  Aggregate,
  AuthenticationEvents,
  DomesticProjector,
  InMemoryEventStore,
  ProjectionHandler,
  StoredEvent,
  InMemoryStore,
} from '@infragis/common';
import { User } from '@/domain';
import { IN_MEMORY_USERS_STORE } from '../constants';

@injectable()
export class InMemoryUserProjector extends DomesticProjector {
  aggregateClass: Class<Aggregate> | undefined = User;

  @inject(InMemoryEventStore) private eventStore: InMemoryEventStore;
  @inject(IN_MEMORY_USERS_STORE) usersStore: InMemoryStore;

  private position = 0;
  protected projection: Record<any, any> = {};

  async getPosition(): Promise<number> {
    return this.position;
  }

  async increasePosition(): Promise<void> {
    this.position++;
  }

  getEvents(from: number): Promise<StoredEvent[]> {
    return this.eventStore.getAllEvents(from);
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
  async created({ aggregateId, data }: StoredEvent<AuthenticationEvents.UserCreatedData>) {
    this.logger.info(`Received in InMemoryUserProjector: ${JSON.stringify(data)}`);

    const userDocument = {
      id: aggregateId,
    };

    this.usersStore.set(data.email, userDocument);
  }
}
