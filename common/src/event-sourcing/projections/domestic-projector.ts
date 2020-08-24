import { inject, injectable, postConstruct } from 'inversify';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Class } from 'utility-types';
import { Aggregate } from '../core';
import { Projector } from './projector';
import { DOMAIN_EVENTS_LISTENER, IDomainEventsListener } from '../publishing';

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

  @inject(DOMAIN_EVENTS_LISTENER)
  protected domainEventListener!: IDomainEventsListener;

  @postConstruct()
  startListening(): void {
    this.domainEventListener
      .listen(this.aggregateClass)
      .pipe(concatMap((event) => from(this.apply(event))))
      .subscribe();
  }
}
