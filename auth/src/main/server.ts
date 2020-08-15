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
import env, { assertEnvSet } from './config/env';
import { ILogger, LOGGER_TYPE } from '@/core/utils/';

@injectable()
export class AuthServer {
  constructor(@inject(LOGGER_TYPE) private logger: ILogger) {
    this.logger.info('Starting Auth Service...');

    // assert env vars
    assertEnvSet();

    // Connecting to database
    this.connectToDb();

    // start server
    app.listen(app.get('port'), () => {
      this.logger.info(
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
        env.POSTGRES_DB,
        env.POSTGRES_USER,
        env.POSTGRES_PASSWORD,
        {
          dialect: 'postgres',
          host: env.POSTGRES_HOST,
          port: 5432,
        }
      );
      console.log('Connected to Postgres');
    } catch (err) {
      console.log(err);
    }
  }
}

// const start = async () => {
//   console.log('Starting Auth Service...');

//   // Connecting to database

//   assertEnvSet();

//   try {
//     await authDb.connect(
//       env.POSTGRES_DB,
//       env.POSTGRES_USER,
//       env.POSTGRES_PASSWORD,
//       {
//         dialect: 'postgres',
//         host: env.POSTGRES_HOST,
//       }
//     );
//     console.log('Connected to Postgres');

//   } catch (err) {
//     console.log(err);
//   }

//   app.listen(app.get('port'), () => {
//     console.log(
//       '  App is running on %d port in %s mode',
//       app.get('port'),
//       app.get('env')
//     );
//     console.log('  Press CTRL-C to stop\n');

//     console.log(process.env.NODE_ENV);
//   });
// };

// start();
