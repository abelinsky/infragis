import { IUserRepo } from '@/repos/userRepo';
import { User } from '@/domain/user';
import { UserMapper } from '@/mappers/user-map';
import { ModelsHolder } from '@/infra/db/sequelize/models-holder';

export class SequelizeUserRepo implements IUserRepo {
  constructor(protected _modelsHolder: ModelsHolder) {}

  async exists(email: string): Promise<boolean> {
    const existingUser = await this._modelsHolder.User.findOne({
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
      await this._modelsHolder.User.create(sequelizeUser);
    }
  }
}
