import { Projector } from './projector';
import { inject, injectable, postConstruct } from 'inversify';
import { DOMAIN_EVENTS_LISTENER, IDomainEventsListener } from '../publishing';
import { Aggregate } from '../core';
import { concatMap } from 'rxjs/operators';
import { from } from 'rxjs';

/**
 * Internal Projector which listens to domain events published internally
 * by DomainEventsPublisher (just after persisting the events).
 */
@injectable()
export abstract class DomesticMemoryProjector extends Projector {
  private position = 0;
  protected projection: Record<any, any> = {};

  /**
   * If defined, Projector will listen to the events in this type of aggregates.
   */
  abstract aggregateClass: typeof Aggregate | undefined = undefined;

  @inject(DOMAIN_EVENTS_LISTENER)
  protected domainEventListener!: IDomainEventsListener;

  @postConstruct()
  startListening(): void {
    this.domainEventListener
      .listen(this.aggregateClass)
      .pipe(concatMap((event) => from(this.apply(event))))
      .subscribe();
  }

  async getPosition(): Promise<number> {
    return this.position;
  }

  async increasePosition(): Promise<void> {
    this.position++;
  }
}
