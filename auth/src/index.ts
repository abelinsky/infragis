import { app } from './app';
import { authDb } from './models/authdb';

const start = async () => {
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

  process.on('SIGINT', () => authDb.client.close());
  process.on('SIGTERM', () => authDb.client.close());

  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start();
