import { inject, injectable } from 'inversify';
import { from, Unsubscribable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Class } from 'utility-types';
import { Aggregate } from '../core';
import { IDomainEventsListener } from '../publishing';
import { Projector } from './projector';
import { DOMAIN_EVENTS_LISTENER } from '../../dependency-injection';
import { StoredEvent } from '../index';

/**
 * An internal Projector that listens for domain events published internally
 * (within the current BoundedContext aka Service) by DomainEventsPublisher
 * and performs internal projections. For handling and projecting notifications
 * see {@link NotificationProjector}.
 */
@injectable()
export abstract class DomesticProjector extends Projector {
  abstract async getEvents(after: number): Promise<StoredEvent[]>;
  /**
   * If defined, the Projector will listen for events aggregates of this type.
   */
  abstract aggregateClass: Class<Aggregate> | undefined = undefined;
  private subscription: Unsubscribable | undefined = undefined;
  @inject(DOMAIN_EVENTS_LISTENER) protected domainEventListener!: IDomainEventsListener;

  /**
   * Initializes the projector. This method is called
   * in the start of the projector. Can be useful
   * in overloaded versions.
   */
  async initialize(): Promise<void> {
    // process initialization tasks in overloaded version
  }

  async start(): Promise<void> {
    await this.initialize();
    // Replays events at startup to get the actual state
    // of the projections
    await this.replay();
    this.subscription = this.domainEventListener
      .getListener(this.aggregateClass)
      .pipe(concatMap((event) => from(this.apply(event))))
      .subscribe();
  }

  async stop(): Promise<void> {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
