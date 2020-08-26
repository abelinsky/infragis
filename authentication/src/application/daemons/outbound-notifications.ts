import { Unsubscribable } from 'rxjs';
import {
  ApplicationDaemon,
  Daemon,
  DOMAIN_EVENTS_LISTENER,
  IDomainEventsListener,
  EventName,
  NOTIFICATION_PRODUCER,
  INotificationProducer,
} from '@infragis/common';
import { inject } from 'inversify';

@ApplicationDaemon()
export class OutboundNotifications extends Daemon {
  name: string = 'outbound-notify-d';

  private subscription: Unsubscribable | undefined = undefined;

  constructor(
    @inject(NOTIFICATION_PRODUCER) private kafkaProducer: INotificationProducer,
    @inject(DOMAIN_EVENTS_LISTENER) private domainEventsListener: IDomainEventsListener
  ) {
    super();
  }

  async start(): Promise<boolean> {
    this.subscription = this.domainEventsListener.getListener().subscribe((event) => {
      const eventName = EventName.fromString(event.name);
      this.kafkaProducer.publishNotifications(eventName.getTopic(), [event]);
    });
    return true;
  }

  async stop(): Promise<void> {
    this.subscription?.unsubscribe();
  }
}
