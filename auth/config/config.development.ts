import { Dialect } from 'sequelize/types';

export const config = {
  database: {
    dialect: 'postgres' as Dialect,
    host: process.env.POSTGRES_HOST,
    port: 5432, // default postgres port
    username: process.env.POSTGRES_USER, // default postgres user
    password: process.env.POSTGRES_PASSWORD, // default user password (default)
    database: process.env.POSTGRES_DB,
    logging: false, // logging can be enabled via console.log
    sync: {
      // we are not syncing because this drops complete structure on every new connection and rebuilds it
      force: false,
      logging: false,
      alter: false,
    },
  },
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
};
