// TODO: Check credentials for dev/test/prod
const databaseCredentials = {
  development: {
    username: process.env.POSTGRES_USER, // default postgres user
    password: process.env.POSTGRES_PASSWORD, // default user password (default)
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: false, // logging can be enabled via console.log
    sync: {
      // we are not syncing because this drops complete structure on every new connection and rebuilds it
      force: false,
      logging: false,
      alter: false,
    },
  },
  test: {
    username: process.env.POSTGRES_USER, // default postgres user
    password: process.env.POSTGRES_PASSWORD, // default user password (default)
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: 5432, // default postgres port
    dialect: 'postgres',
    logging: false, // logging can be enabled via console.log
    sync: {
      // we are not syncing because this drops complete structure on every new connection and rebuilds it
      force: false,
      logging: false,
      alter: false,
    },
  },
  production: {
    username: process.env.POSTGRES_USER, // default postgres user
    password: process.env.POSTGRES_PASSWORD, // default user password (default)
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: 5432, // default postgres port
    dialect: 'postgres',
    logging: false, // logging can be enabled via console.log
    sync: {
      // we are not syncing because this drops complete structure on every new connection and rebuilds it
      force: false,
      logging: false,
      alter: false,
    },
  },
};

module.exports = databaseCredentials[process.env.NODE_ENV];
