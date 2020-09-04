import { inject, injectable } from 'inversify';
import { from, Unsubscribable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { IDomainEventsListener } from '../publishing';
import { Projector } from './projector';
import { DOMAIN_EVENTS_LISTENER } from '../../dependency-injection';
// import { eachValueFrom } from 'rxjs-for-await';

/**
 * An internal Projector that listens for domain events published internally
 * (within the current BoundedContext aka Service) by DomainEventsPublisher
 * and performs internal projections. For handling and projecting notifications
 * see {@link NotificationProjector}.
 */
@injectable()
export abstract class DomesticProjector extends Projector {
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

    // Will listen to topics that the Projector is interested in due to the
    // set of the @ProjectionHandler methods inside it
    const topics = this.getTopics();
    const regex = new RegExp(topics.join('|'), 'i');

    this.subscription = this.domainEventListener
      .getListener(regex)
      .pipe(concatMap((event) => from(this.apply(event))))
      .subscribe();

    // const source$ = this.domainEventListener.getListener(regex);
    // for await (const event of eachValueFrom(source$)) {
    //   await this.apply(event);
    // }
  }

  async stop(): Promise<void> {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
