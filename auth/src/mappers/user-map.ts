import { User } from '../domain/user';
import { UserAttributes as UserPersistence } from '../infra/db/sequelize/models/user';

export class UserMapper {
  public static toPersistence(user: User): UserPersistence {
    return {
      email: user.props.email,
      password: user.props.password,
      id: user.props.id,
    };
  }
}
