import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';

export class EventName {
  private check = new RegExp(/^[A-Z]+$/i);

  constructor(
    public readonly name: string,
    public readonly aggregate: string,
    public readonly service?: string
  ) {
    if (!this.check.exec(name)) throw new InvalidEventName(name);
    if (!this.check.exec(aggregate)) throw new InvalidEventName(name);
    if (service && !this.check.exec(service))
      throw new InvalidEventName(name);
  }
  /**
   * Factory for @param EventName instantiation.
   * @param eventName name of the event: serviceName.aggregateName:method or aggregateName:method
   * @example
   *    authentication.session:signInRequested
   *    user:userCreated
   */
  static create(eventName: string) {
    const [namespace, name] = eventName.split(':');
    const aggregate = namespace.includes('.')
      ? namespace.substring(
          namespace.lastIndexOf('.') + 1,
          namespace.length
        )
      : namespace;
    const service = namespace.includes('.')
      ? namespace.substring(0, namespace.indexOf('.'))
      : undefined;
    return new EventName(name, aggregate, service);
  }

  toString() {
    return this.service
      ? `${this.service}.${this.aggregate}:${this.name}`
      : `${this.aggregate}:${this.name}`;
  }
}

export class InvalidEventName extends ServiceException {
  code = RpcStatus.INVALID_ARGUMENT;

  constructor(eventName: string) {
    super(`Invalid event name: ${eventName}`);
  }
}
