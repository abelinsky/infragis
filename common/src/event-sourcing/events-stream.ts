import { Id } from '../types';
import { IDomainEvent } from './domain-event';
import { StreamVersion } from './stream-version';

class StreamEvent {
  constructor(
    public readonly event: IDomainEvent,
    public readonly version: StreamVersion
  ) {}
}

export class EventsStream {
  constructor(
    public readonly aggregateId: Id,
    private readonly events: StreamEvent[]
  ) {}

  static create(id: Id): EventsStream {
    return new EventsStream(id, []);
  }

  addEvent(event: IDomainEvent, version: StreamVersion) {
    this.events.push(new StreamEvent(event, version.copy()));
  }

  toArray(): StreamEvent[] {
    return this.events;
  }

  toEvents(): IDomainEvent[] {
    return this.events.map((s) => s.event);
  }

  isEmpty(): boolean {
    return this.events.length === 0;
  }
}
