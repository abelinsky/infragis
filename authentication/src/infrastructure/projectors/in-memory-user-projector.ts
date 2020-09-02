import { inject, injectable } from 'inversify';
import {
  AuthenticationEvents,
  AuthenticationQueryModel,
  DomesticProjector,
  InMemoryEventStore,
  ProjectionHandler,
  StoredEvent,
  InMemoryStore,
} from '@infragis/common';
import { IN_MEMORY_USERS_STORE } from '../constants';

/**
 * Helper implementation for test purposes.
 */
@injectable()
export class InMemoryUserProjector extends DomesticProjector {
  groupId = 'in_memory_user_projector';

  @inject(InMemoryEventStore) private eventStore: InMemoryEventStore;
  @inject(IN_MEMORY_USERS_STORE) usersStore: InMemoryStore;

  private offset = 0;
  protected projection: Record<any, any> = {};

  async getOffset(_topic: string): Promise<number> {
    return this.offset;
  }

  async setOffset(lastProjectedEvent: StoredEvent<Record<any, any>>): Promise<void> {
    this.offset++;
  }

  getEvents(from: number): Promise<StoredEvent[]> {
    return this.eventStore.getAllEvents(from);
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
  async created(event: StoredEvent<AuthenticationEvents.UserCreatedData>) {
    const userDocument: AuthenticationQueryModel.UserView = {
      userId: event.aggregateId,
      createdAt: event.data.createdAt,
      email: event.data.email,
      sessionId: undefined,
    };

    this.usersStore.set(event.data.email, userDocument);
  }
}
