import { inject, injectable, postConstruct } from 'inversify';
import { from, Unsubscribable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Class } from 'utility-types';
import { Aggregate } from '../core';
import { IDomainEventsListener } from '../publishing';
import { Projector } from './projector';
import { DOMAIN_EVENTS_LISTENER, LOGGER_TYPE } from '../../dependency-injection';

/**
 * Internal Projector which listens to domain events published internally
 * by DomainEventsPublisher (just after persisting the events).
 */
@injectable()
export abstract class DomesticProjector extends Projector {
  /**
   * If defined, Projector will listen to the events in this type of aggregates.
   */
  abstract aggregateClass: Class<Aggregate> | undefined = undefined;
  private subscription: Unsubscribable | undefined = undefined;

  constructor(
    @inject(DOMAIN_EVENTS_LISTENER)
    protected domainEventListener: IDomainEventsListener
  ) {
    super();
  }

  async start(): Promise<void> {
    this.subscription = this.domainEventListener
      .getListener(this.aggregateClass)
      .pipe(concatMap((event) => from(this.apply(event))))
      .subscribe();
  }

  async stop(): Promise<void> {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
