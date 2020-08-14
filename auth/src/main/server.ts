import moduleAlias from 'module-alias';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  // We are in ts-node-env watch. Just set @ to up one directory
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import app from './app';
import { authDb } from '@/infra/db/sequelize/auth-db';
import env, { assertEnvSet } from './config/env';

const start = async () => {
  console.log('Starting Auth Service...');

  // if (!process.env.JWT_KEY) {
  //   throw new Error('JWT_KEY must be defined.');
  // }
  // if (!process.env.POSTGRES_DB) {
  //   throw new Error('POSTGRES_DB env variable must be defined');
  // }
  // if (!process.env.POSTGRES_USER) {
  //   throw new Error('POSTGRES_USER env variable must be defined');
  // }
  // if (!process.env.POSTGRES_PASSWORD) {
  //   throw new Error('POSTGRES_PASSWORD env variable must be defined');
  // }
  // if (!process.env.POSTGRES_HOST) {
  //   throw new Error('POSTGRES_HOST env variable must be defined');
  // }

  // Connecting to database

  assertEnvSet();

  try {
    await authDb.connect(
      env.POSTGRES_DB,
      env.POSTGRES_USER,
      env.POSTGRES_PASSWORD,
      {
        dialect: 'postgres',
        host: env.POSTGRES_HOST,
      }
    );
    console.log('Connected to Postgres');

    // authDb.client.addHook('afterDisconnect', () => {
    //   console.log('Database connection has been disconnected');
    // });
  } catch (err) {
    console.log(err);
  }

  // process.on('SIGINT', () => {
  //   console.log('[SIGINT] Closing database connection');
  //   authDb.client.close();
  // });
  // process.on('SIGTERM', () => {
  //   console.log('[SIGTERM] Closing database connection');
  //   authDb.client.close();
  // });

  app.listen(app.get('port'), () => {
    console.log(
      '  App is running on %d port in %s mode',
      app.get('port'),
      app.get('env')
    );
    console.log('  Press CTRL-C to stop\n');

    console.log(process.env.NODE_ENV);
  });
};

start();
