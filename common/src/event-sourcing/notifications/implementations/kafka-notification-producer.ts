import { injectable, inject, postConstruct } from 'inversify';
import { INotificationProducer } from '../notification-producer';
import { Kafka, Message, logLevel } from 'kafkajs';
import { ILogger } from '../../../utils';
import { StoredEvent } from '../../core';
import { encodeEventToNotification } from '../../../api-contracts';
import { IConfig } from '../../../config';
import { GLOBAL_CONFIG, LOGGER_TYPE } from '../../../dependency-injection';

export const EVENT_HEADER = 'eventName';

@injectable()
export class KafkaNotificationProducer implements INotificationProducer {
  private kafka = new Kafka({
    brokers: this.globalConfig.getArray('global.kafka.brokers'),
    logLevel: logLevel.WARN,
  });

  private kafkaProducer = this.kafka.producer();
  private connected = false;

  constructor(
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {}

  @postConstruct()
  initializeProducer() {
    this.kafkaProducer.on('producer.disconnect', () => {
      this.logger.warn('Notification producer has been disconnected from kafka...');
      this.connected = false;
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Pushes notifications to kafka.
   * @param topic Topic to push notification to.
   * @param events Stored domain events that are transformed into notification messages.
   */
  async publishNotifications(topic: string, events: StoredEvent[]): Promise<void> {
    const alive = await this.establishConnection();
    if (!alive) {
      this.logger.warn('Failed to connect and to send notification to event bus.');
      return;
    }
    const messages: Message[] = events.map((event) => ({
      key: event.aggregateId,
      value: encodeEventToNotification(event),
      headers: { [EVENT_HEADER]: event.name },
    }));

    try {
      await this.kafkaProducer!.send({ topic, messages });
      this.logger.info(`Events were sent to topic ${topic}: `, ...events.map((e) => e.name));
    } catch (err) {
      this.logger.info(
        `Failed to send events to topic ${topic}: `,
        ...events.map((e) => e.name),
        err.toString()
      );
    }
  }

  /**
   * Disconnects from kafks stops producing messages.
   */
  async disconnect(): Promise<boolean> {
    try {
      if (this.kafkaProducer) await this.kafkaProducer.disconnect();
      return true;
    } catch (err) {
      this.logger.warn('Error while disconnecting kafka producer.', err);
    }
    return false;
  }

  protected async establishConnection(): Promise<boolean> {
    if (this.isConnected()) return true;

    await this.kafkaProducer.connect().catch((err) => {
      this.logger.error('Failed to connect to Kafka cluster...');
      return false;
    });

    this.connected = true;
    this.logger.debug('NotificationProducer is connected to kafka.');
    return true;
  }
}
