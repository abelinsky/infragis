import path from 'path';
import { ApplicationJob, ILogger, Job, LOGGER_TYPE, DATABASE, IDatabase } from '@infragis/common';
import { inject } from 'inversify';

import name from 'module-alias';

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
    // Perform database migrations
    await this.database.migrate(
      path.join(__dirname, '../..', 'infrastructure/database/postgres/migrations')
    );

    // Perform database seed
    await this.database.seed(
      path.join(__dirname, '../..', 'infrastructure/database/postgres/seeds')
    );

    return false;
  }
}
