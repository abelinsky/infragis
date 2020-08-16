import moduleAlias from 'module-alias';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  // We are in ts-node-env watch. Just set @ to up one directory
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import { injectable, inject } from 'inversify';
import app from './app';
import { authDb } from '@/infra/db/sequelize/auth-db';
import { ILogger, LOGGER_TYPE } from '@/core/utils/';
import { IConfig, GLOBAL_CONFIG_TYPE } from '@/core/config';
import { AUTH_CONFIG_TYPE } from './auth.config';

@injectable()
export class AuthServer {
  constructor(
    @inject(GLOBAL_CONFIG_TYPE) private _globalConfig: IConfig,
    @inject(AUTH_CONFIG_TYPE) private _authConfig: IConfig,
    @inject(LOGGER_TYPE) private _logger: ILogger
  ) {
    this._logger.info(
      `Starting Auth Service in ${this._globalConfig.get(
        'global.environment'
      )} mode...`
    );

    // Connecting to database
    (async () => {
      await this.connectToDb();
    })();

    // start server
    app.listen(app.get('port'), () => {
      this._logger.info(
        `  App is running on ${app.get('port')} port in ${app.get(
          'env'
        )} mode`
      );
      console.log('  Press CTRL-C to stop\n');
    });
  }

  async connectToDb(): Promise<void> {
    try {
      await authDb.connect(
        this._authConfig.get('auth.database.name'),
        this._authConfig.get('auth.database.user'),
        this._authConfig.get('auth.database.password'),
        {
          dialect: 'postgres',
          host: this._authConfig.get('auth.database.host'),
          port: 5432,
        }
      );
      console.log('Connected to Postgres');
    } catch (err) {
      console.log(err);
    }
  }
}
