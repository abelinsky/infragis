import { IUserRepo } from '@/data/repos/user-repo';
import { User } from '@/domain/models/user';
import { UserMapper } from '@/data/mappers/user-map';
import { IModels } from '@/infra/db/sequelize/imodels';

export class SequelizeUserRepo implements IUserRepo {
  constructor(protected _models: IModels) {}

  async exists(email: string): Promise<boolean> {
    const existingUser = await this._models.User.findOne({
      where: {
        email,
      },
    });
    return !!existingUser;
  }

  async save(user: User): Promise<void> {
    const exists = await this.exists(user.props.email);
    if (!exists) {
      const sequelizeUser = UserMapper.toPersistence(user);
      await this._models.User.create(sequelizeUser);
    }
  }
}
