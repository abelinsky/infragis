import { inject, injectable, interfaces } from 'inversify';
import { Consumer, Kafka, logLevel } from 'kafkajs';
import { async, Observable, Observer } from 'rxjs';
import shortid from 'shortid';

import { decodeEventFromNotification } from '../../../api-contracts';
import { GLOBAL_CONFIG, IConfig } from '../../../config';
import { EventName } from '../../../types';
import { ILogger, LOGGER_TYPE } from '../../../utils';
import { StoredEvent } from '../../core';
import { INotificationConsumer, NOTIFICATION_CONSUMER } from '../notification-consumer';

import { EVENT_HEADER } from './kafka-notification-producer';

@injectable()
export class KafkaNotificationConsumer implements INotificationConsumer {
  id: string = shortid();

  private kafka = new Kafka({
    brokers: this.globalConfig.getArray('global.kafka.brokers'),
    logLevel: logLevel.WARN,
  });
  private kafkaConsumer: Consumer | undefined;
  private connected = false;

  constructor(
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {}

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<boolean> {
    try {
      this.logger.warn('Disconnecting kafka consumer');
      if (this.kafkaConsumer) await this.kafkaConsumer.disconnect();
      this.logger.warn('kafka consumer has been disconnected');
      return true;
    } catch (error) {
      this.logger.warn('Rrror occured while disconnecting kafka consumer', error);
    }
    return false;
  }

  getListener(topic: string | RegExp, consumerGroup: string): Observable<StoredEvent> {
    if (!this.kafka) throw new Error('Kafka listener was not initialized properly.');
    if (!!this.kafkaConsumer)
      throw new Error('Initialization of the same KafkaNotificationConsumer twice is not allowed.');

    this.kafkaConsumer = this.kafka.consumer({ groupId: consumerGroup });

    this.kafkaConsumer.on('consumer.connect', () => {
      this.connected = true;
      this.logger.debug(
        `Notification listener from group ${consumerGroup} is connected and listening for events in ${topic.toString()}`
      );
    });
    this.kafkaConsumer.on('consumer.crash', () => {
      this.connected = false;
      this.logger.warn(`Notification listener from group ${consumerGroup} is disconnected `);
    });
    this.kafkaConsumer.on('consumer.disconnect', () => {
      this.connected = false;
      this.logger.warn(`Group ${consumerGroup} is disconnected `);
    });

    return Observable.create(async (observer: Observer<StoredEvent>) => {
      await this.kafkaConsumer!.connect();

      /**
       * When fromBeginning is true, the group will use the earliest offset. If
       * set to false, it will use the latest *   offset. The default is false.
       * See https://kafka.js.org/docs/consuming.
       */
      await this.kafkaConsumer!.subscribe({ topic, fromBeginning: false });

      const groupDescription = await this.kafkaConsumer!.describeGroup();
      this.logger.debug(`Kafka consumer group ${consumerGroup} has subscribed to ${topic} topic.`);

      await this.kafkaConsumer!.run({
        eachMessage: async ({ message }) => {
          try {
            const eventHeader = message.headers && message.headers[EVENT_HEADER];
            if (!eventHeader) {
              throw new Error(
                'Notification listener has consumed impropertly configured message without header from kafka'
              );
            }
            this.logger.debug(
              `Notification listener has consumed message with header ${eventHeader.toString()}.`
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
}
