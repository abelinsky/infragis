import { Dialect } from 'sequelize/types';

export const config = {
  database: {
    dialect: 'postgres' as Dialect,
    host: process.env.POSTGRES_HOST,
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    logging: false,
  },
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
};
