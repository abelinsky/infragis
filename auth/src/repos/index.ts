import { SequelizeUserRepo } from './implementations/sequelize-user-repo';
import { authDb } from '@/infra/db/sequelize/authdb';

export const sequelizeUserRepo = new SequelizeUserRepo(authDb);
