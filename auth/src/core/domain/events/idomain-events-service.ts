import { IDomainEvent } from '@/core/domain/events/idomain-event';
import { UniqueId } from '@/core/domain/unique-id';

export interface IDomainEventsService {
  /**
   * Asynchronously dispatches emitted domain event.
   * @param event Emitted Domain Event
   */
  dispatch(event: IDomainEvent<unknown>): Promise<void>;

  /**
   * Dispatches all registered events.
   */
  dispatchAll(): Promise<void>;

  /**
   * Asynchronously dispatches events, emitted by specified emitter (entity).
   * @param id Emitter id
   */
  dispatchForEmitter(id: UniqueId): Promise<void>;

  /**
   * Registeres event for further dispatching.
   * @param event Domain event to be registered.
   */
  register(event: IDomainEvent<unknown>): void;
}
