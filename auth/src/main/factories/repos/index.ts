import { SequelizeUserRepo } from '../../../infra/db/sequelize/repos/sequelize-user-repo';
import { authDb } from '@/infra/db/sequelize/auth-db';

export const sequelizeUserRepo = new SequelizeUserRepo(authDb);
