import { injectable, inject } from 'inversify';
import { Admin, Kafka, ITopicConfig } from 'kafkajs';
import { NotificationTopics, LOGGER_TYPE, ILogger, GLOBAL_CONFIG, IConfig } from '@infragis/common';

@injectable()
export class CreateKafkaTopics {
  constructor(
    @inject(LOGGER_TYPE) private logger: ILogger,
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig
  ) {}

  /**
   * Creates kafka topics declared in shared API contract.
   */
  async execute(): Promise<boolean | Error> {
    let kafkaAdmin: Admin = undefined;

    try {
      this.logger.info('Creating kafka topics...');

      const kafka = new Kafka({
        clientId: 'infragis.admin',
        brokers: this.globalConfig.getArray('global.kafka.brokers'),
      });

      kafkaAdmin = kafka.admin();
      await kafkaAdmin.connect();

      const topics = Object.values(NotificationTopics).map((topic) => topic.toString());
      const topicConfigs: ITopicConfig[] = topics.map((t) => ({ topic: t }));
      const result = await kafkaAdmin.createTopics({ topics: topicConfigs });
      this.logger.info(
        result ? 'Kafka topics are created.' : 'Kafka topics have already been created.'
      );

      await kafkaAdmin.disconnect();

      return true;
    } catch (err) {
      this.logger.error('Failed to create kafka topics.');
      this.logger.error(err);
      if (kafkaAdmin) {
        await kafkaAdmin.disconnect();
        kafkaAdmin = undefined;
      }
      return err;
    } finally {
      if (kafkaAdmin) {
        await kafkaAdmin.disconnect();
      }
    }
  }
}
