import { Unsubscribable } from 'rxjs';
import { logLevel } from 'kafkajs';
import {
  ApplicationDaemon,
  Daemon,
  ILogger,
  LOGGER_TYPE,
  KafkaNotificationProducerFactory,
  GLOBAL_CONFIG,
  IConfig,
  DOMAIN_EVENTS_LISTENER,
  IDomainEventsListener,
  EventName,
  KAFKA_NOTIFICATION_PRODUCER_FACTORY,
} from '@infragis/common';
import { inject } from 'inversify';

@ApplicationDaemon()
export class OutboundNotifications extends Daemon {
  name: string = 'outbound-notify-d';

  private subscription: Unsubscribable | undefined = undefined;

  private kafkaProducer = this.producerFactory({
    brokers: this.globalConfig.getArray('global.kafka.brokers'),
    logLevel: logLevel.WARN,
  });

  constructor(
    @inject(KAFKA_NOTIFICATION_PRODUCER_FACTORY)
    private producerFactory: KafkaNotificationProducerFactory,
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig,
    @inject(LOGGER_TYPE) private logger: ILogger,
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
