import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';

export class EventName {
  constructor(
    public readonly service: string,
    public readonly aggregate: string,
    public readonly eventName: string
  ) {}

  /**
   * Factory for @param EventName instantiation.
   * @param eventName Name of the event in the format: serviceName.aggregateName.eventName
   * @example
   *    authentication.session.signInRequested
   *    users.user.userCreated
   */
  static fromString(eventName: string): EventName {
    const regexEventName = new RegExp(/^[A-Z]+\.[A-Z]+\.[A-Z]+$/i);
    if (!regexEventName.exec(eventName)) throw new InvalidEventName(eventName);
    const [service, aggregate, event] = eventName.split('.');
    return new EventName(service, aggregate, event);
  }

  toString(): string {
    return `${this.service}.${this.aggregate}:${this.eventName}`;
  }

  /**
   * Gets topic name in format `serviceName.events.aggregateName.`
   */
  getTopic(): string {
    return `${this.service}.events.${this.aggregate}`;
  }
}

export class InvalidEventName extends ServiceException {
  code = RpcStatus.INVALID_ARGUMENT;

  constructor(eventName: string) {
    super(`Invalid event name: ${eventName}`);
  }
}
