import { ApplicationJob, ILogger, Job, LOGGER_TYPE, DATABASE, IDatabase } from '@infragis/common';
import { inject } from 'inversify';

@ApplicationJob()
export class DatabaseMigrateJob extends Job {
  readonly name = 'database-migrate-job';

  constructor(
    @inject(LOGGER_TYPE) private logger: ILogger,
    @inject(DATABASE) private database: IDatabase
  ) {
    super();
  }

  async execute(): Promise<boolean> {
    this.logger.info('Hello from DatabaseMigrateJob');
    await this.database.migrate('migrate database');
    await this.database.seed('seed database');
    return false;
  }
}
