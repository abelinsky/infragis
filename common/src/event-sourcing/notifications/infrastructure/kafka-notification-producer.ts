import { injectable, inject, interfaces } from 'inversify';
import { INotificationProducer, NOTIFICATION_PRODUCER } from '../notification-producer';
import { Kafka, Producer, KafkaConfig, Message } from 'kafkajs';
import { ILogger, LOGGER_TYPE } from '../../../utils';
import { StoredEvent } from '../../core';
import { encodeEventToNotification } from '../../../api-contracts';

export const EVENT_HEADER = 'eventName';

@injectable()
export class KafkaNotificationProducer implements INotificationProducer {
  private kafka: Kafka | undefined;
  private kafkaProducer: Producer | undefined;
  private connected = false;

  constructor(@inject(LOGGER_TYPE) private logger: ILogger) {}

  initialize(kafkaInstance: Kafka) {
    this.kafka = kafkaInstance;
    this.kafkaProducer = this.kafka.producer();

    this.kafkaProducer.on('producer.disconnect', () => {
      this.logger.info('Kafka producer has been disconnected from Kafka...');
      this.connected = false;
    });
  }

  isConnected(): boolean {
    return !!this.kafka && this.connected;
  }

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
      this.logger.info(`Events were sent to topic ${topic}`, ...events.map((e) => e.name));
    } catch (err) {
      this.logger.info(
        `Failed to send events to topic ${topic}`,
        ...events.map((e) => e.name),
        err.toString()
      );
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.kafkaProducer) await this.kafkaProducer.disconnect();
      return true;
    } catch (err) {
      this.logger.warn('error while disconnecting kafka producer', err);
    }
    return false;
  }

  protected async establishConnection(): Promise<boolean> {
    if (this.isConnected()) return true;
    if (!this.kafkaProducer) {
      this.logger.warn(
        'Connection to Kafka from KafkaNotificationProducer failed because ' +
          'kafka producer is unavailable'
      );
      return false;
    }

    await this.kafkaProducer
      .connect()
      .catch((err) => this.logger.error('Failed to connect to Kafka cluster...'));

    this.connected = true;
    this.logger.debug('KafkaNotificationProducer is connected to Kafka.');
    return true;
  }
}

export const KAFKA_NOTIFICATION_PRODUCER_FACTORY = Symbol.for(
  '__KafkaNotificationProducerFactory__'
);

export type KafkaNotificationProducerFactory = (config: KafkaConfig) => KafkaNotificationProducer;
export const kafkaNotificationProducerFactory = (
  context: interfaces.Context
): KafkaNotificationProducerFactory => {
  return (config: KafkaConfig) => {
    const producer =
      (context.container.get<INotificationProducer>(
        NOTIFICATION_PRODUCER
      ) as KafkaNotificationProducer) || context.container.get(KafkaNotificationProducer);

    const kafka = new Kafka(config);
    producer.initialize(kafka);

    return producer;
  };
};
