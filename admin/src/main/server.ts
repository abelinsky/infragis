import { injectable, inject } from 'inversify';
import { Admin, Kafka, ITopicConfig } from 'kafkajs';
import {
  ServiceServer,
  NotificationTopics,
  LOGGER_TYPE,
  ILogger,
  GLOBAL_CONFIG,
  IConfig,
} from '@infragis/common';
import { CreateKafkaTopics } from '@/application';

@injectable()
export class AdminServer extends ServiceServer {
  private errors: Error[] = undefined;

  constructor(
    @inject(LOGGER_TYPE) private logger: ILogger,
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig,
    @inject(CreateKafkaTopics) private topicsCreator: CreateKafkaTopics
  ) {
    super();

    (async () => {
      this.createKafkaTopics();
    })();
  }

  async createKafkaTopics(): Promise<void> {
    const result = this.topicsCreator.execute();
    if (result instanceof Error) {
      this.errors.push(result);
    }
  }

  async healthcheck(): Promise<boolean> {
    return !!this.errors;
  }

  async handleShutdown(): Promise<void> {
    // nothing to do here
  }
}
