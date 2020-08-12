import { app } from './app';
import { authDb } from './infra/db/sequelize/authdb';

const start = async () => {
  console.log('Starting Auth Service...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined.');
  }
  if (!process.env.POSTGRES_DB) {
    throw new Error('POSTGRES_DB env variable must be defined');
  }
  if (!process.env.POSTGRES_USER) {
    throw new Error('POSTGRES_USER env variable must be defined');
  }
  if (!process.env.POSTGRES_PASSWORD) {
    throw new Error('POSTGRES_PASSWORD env variable must be defined');
  }
  if (!process.env.POSTGRES_HOST) {
    throw new Error('POSTGRES_HOST env variable must be defined');
  }

  // Connecting to database
  try {
    await authDb.connect(
      process.env.POSTGRES_DB,
      process.env.POSTGRES_USER,
      process.env.POSTGRES_PASSWORD,
      {
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST,
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
  });
};

start();
