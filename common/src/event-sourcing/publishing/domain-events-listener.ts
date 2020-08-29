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
  getListener(aggregateType?: Class<Aggregate> | RegExp): Observable<StoredEvent>;
}

@injectable()
export class DomainEventsListener implements IDomainEventsListener {
  constructor(@inject(DOMAIN_EVENTS_PUBLISHER) private eventPublisher: IDomainEventsPublisher) {}

  protected get eventsSource(): Observable<StoredEvent> {
    return this.eventPublisher;
  }

  getListener(aggregateType?: Class<Aggregate> | RegExp): Observable<StoredEvent> {
    let regExp: RegExp | undefined;
    if (aggregateType && !(aggregateType instanceof RegExp)) {
      regExp = new RegExp(aggregateType.name, 'i');
    }

    return this.eventsSource.pipe(
      filter((event) => {
        const aggregate = EventName.fromString(event.name).aggregate;
        return regExp ? regExp.test(aggregate) : true;
      })
    );
  }
}
