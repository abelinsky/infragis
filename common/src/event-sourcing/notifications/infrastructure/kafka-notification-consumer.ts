import { inject, injectable, interfaces } from 'inversify';
import { Observable, Observer, async } from 'rxjs';
import { KafkaConfig, Kafka, Consumer } from 'kafkajs';
import { INotificationConsumer } from '../notification-consumer';
import { StoredEvent } from '../../core';
import { LOGGER_TYPE, ILogger } from '../../../utils';
import { EVENT_HEADER } from './kafka-notification-producer';
import { EventName } from '../../../types';
import { decodeEventFromNotification } from '../../../api-contracts';

@injectable()
export class KafkaNotificationConsumer implements INotificationConsumer {
  private kafka: Kafka | undefined;
  private kafkaConsumer: Consumer | undefined;
  private connected = false;

  constructor(@inject(LOGGER_TYPE) private logger: ILogger) {}

  isConnected(): boolean {
    return !!this.kafka && this.connected;
  }

  async disconnect(): Promise<boolean> {
    try {
      this.logger.warn('disconnecting kafka consumer');
      if (this.kafkaConsumer) await this.kafkaConsumer.disconnect();
      this.logger.warn('kafka consumer has been disconnected');
      return true;
    } catch (error) {
      this.logger.warn('error occured while disconnecting kafka consumer', error);
    }
    return false;
  }

  getListener(topic: string | RegExp, consumerGroup: string): Observable<StoredEvent> {
    if (!this.kafka) throw new Error('Kafka listener was not initialized properly.');
    if (!!this.kafkaConsumer)
      throw new Error('Initialization of the same KafkaNotificationConsumer twice is not allowed.');

    this.kafkaConsumer = this.kafka.consumer({ groupId: consumerGroup });

    this.kafkaConsumer.on('consumer.crash', () => (this.connected = false));
    this.kafkaConsumer.on('consumer.connect', () => (this.connected = true));
    this.kafkaConsumer.on('consumer.disconnect', () => (this.connected = false));

    return Observable.create(async (observer: Observer<StoredEvent>) => {
      await this.kafkaConsumer!.connect();

      /**
       * When fromBeginning is true, the group will use the earliest offset. If set to false, it will use the latest *   offset. The default is false. See https://kafka.js.org/docs/consuming.
       */
      await this.kafkaConsumer!.subscribe({ topic, fromBeginning: false });
      this.logger.info(`Kafka consumer group ${consumerGroup} has subscribed to ${topic} topic.`);

      await this.kafkaConsumer!.run({
        eachMessage: async ({ message }) => {
          try {
            const eventHeader = message.headers && message.headers[EVENT_HEADER];
            if (!eventHeader) {
              throw new Error(
                'Kafka listener has consumed impropertly configured message without header'
              );
            }
            this.logger.info(
              `Kafka listener consumes message with header ${eventHeader.toString()}`
            );
            const eventName = EventName.fromString(eventHeader.toString());
            const deserializedNotification = decodeEventFromNotification(message.value, eventName);
            observer.next(deserializedNotification);
          } catch (error) {
            this.logger.error(error);
          }
        },
      });
    });
  }

  initialize(kafkaInstance: Kafka) {
    this.kafka = kafkaInstance;
  }
}

export const KAFKA_NOTIFICATION_CONSUMER = Symbol('__KafkaNotificationConsumer__');
export type KafkaNotificationConsumerFactory = (config: KafkaConfig) => KafkaNotificationConsumer;

export const kafkaNotificationConsumerFactory = (
  context: interfaces.Context
): KafkaNotificationConsumerFactory => {
  return function (config: KafkaConfig) {
    const consumer =
      (context.container.get<INotificationConsumer>(
        KAFKA_NOTIFICATION_CONSUMER
      ) as KafkaNotificationConsumer) || context.container.get(KafkaNotificationConsumer);
    const kafka = new Kafka(config);
    consumer.initialize(kafka);
    return consumer;
  };
};
