// Update with your config settings.

module.exports = {
  development: {
    client: 'postgresql',
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  staging: {
    client: 'postgresql',
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
