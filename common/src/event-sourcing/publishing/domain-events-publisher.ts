import { inject, injectable } from 'inversify';
import { Subject, Observable } from 'rxjs';
import { StoredEvent } from '../core/stored-event';
import { LOGGER_TYPE, ILogger } from '../../utils';

/**
 * Publishes events after saving them into a single source of truth.
 * Assumed to be used by subscribers inside Bounded Context (i.e. Service).
 */
export interface IDomainEventsPublisher extends Observable<StoredEvent> {
  /**
   * Publishes events.
   * @param events Event to be published.
   */
  publish(events: StoredEvent[]): void;
}

/**
 * Base {@link IEventPublisher} implementation.
 */
@injectable()
export class DomainEventsPublisher extends Subject<StoredEvent> implements IDomainEventsPublisher {
  @inject(LOGGER_TYPE) logger!: ILogger;

  publish(events: StoredEvent[]): void {
    events.forEach((e) => this.next(e));
  }
}

export const DOMAIN_EVENTS_PUBLISHER = Symbol.for('__IDomainEventsPublisher__');
