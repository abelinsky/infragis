import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Class } from 'utility-types';
import { Aggregate } from '../core';
import { StoredEvent } from '../core/stored-event';
import { IDomainEventsPublisher } from './domain-events-publisher';
import { EventName } from '../../types';
import { DOMAIN_EVENTS_PUBLISHER } from '../../dependency-injection';

export interface IDomainEventsListener {
  getListener(topics?: RegExp): Observable<StoredEvent>;
}

@injectable()
export class DomainEventsListener implements IDomainEventsListener {
  constructor(
    @inject(DOMAIN_EVENTS_PUBLISHER)
    private eventPublisher: IDomainEventsPublisher
  ) {}

  protected get eventsSource(): Observable<StoredEvent> {
    return this.eventPublisher;
  }

  getListener(topics?: RegExp): Observable<StoredEvent> {
    return this.eventsSource.pipe(
      filter((event) => {
        const topic = EventName.fromString(event.name).getTopic();
        return topics ? topics.test(topic) : true;
      })
    );
  }
}
