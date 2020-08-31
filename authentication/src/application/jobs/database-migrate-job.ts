import {ApplicationJob, ILogger, Job, LOGGER_TYPE} from '@infragis/common';
import {inject} from 'inversify';

@ApplicationJob()
export class DatabaseMigrateJob extends Job {
  readonly name = 'database-migrate-job';

  constructor(@inject(LOGGER_TYPE) private logger: ILogger) {
    super();
  }

  async execute(): Promise<boolean> {
    this.logger.info('Hello from DatabaseMigrateJob');
    return false;
  }
}