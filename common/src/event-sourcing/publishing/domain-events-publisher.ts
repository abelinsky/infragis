import { inject, injectable, decorate } from 'inversify';
import { Subject, Observable } from 'rxjs';
import { StoredEvent } from '../core/stored-event';
import { ILogger } from '../../utils';
import { LOGGER_TYPE } from '../../dependency-injection';

/**
 * Publishes events after saving them into a single source of truth.
 * Assumed to be used by subscribers inside Bounded Context (i.e. this service).
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
  constructor(@inject(LOGGER_TYPE) protected logger: ILogger) {
    super();
  }

  /**
   * Publishes (pushes) the events to observers.
   * @param events Persisted events to be published.
   */
  publish(events: StoredEvent[]): void {
    events.forEach((e) => this.next(e));
  }
}
