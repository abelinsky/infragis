import * as sequelize from 'sequelize';
import { Password } from '../services/password';

export const tableName = 'User';

// Attributes specified when creating a new instance of the model.
// Fields of a single database row
export interface UserAttributes {
  id?: number; // automatically set by Sequelize
  email: string;
  password: string;
  readonly createdAt?: Date; // automatically set by Sequelize
  readonly updatedAt?: Date; // automatically set by Sequelize
}

// We need to declare an interface for our model that is basically what our class would be
interface UserModel
  extends sequelize.Model<UserAttributes>,
    UserAttributes {}
// export class User extends Model<UserModel, UserAttributes> {}

export type UserStaticModel = typeof sequelize.Model & {
  new (values?: object, options?: sequelize.BuildOptions): UserModel;
};

export function userFactory(
  sequelize_instance: sequelize.Sequelize
): UserStaticModel {
  const User = <UserStaticModel>sequelize_instance.define(tableName, {
    id: {
      type: sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: sequelize.DataTypes.UUIDV4,
      comment: 'Id of the instance',
    },
    email: {
      type: sequelize.DataTypes.STRING(),
      allowNull: false,
      unique: true,
      comment: 'Unique email',
    },
    password: {
      type: sequelize.DataTypes.STRING,
      allowNull: false,
      comment: "User's password",
    },
    createdAt: {
      type: sequelize.DataTypes.DATE,
      allowNull: false,
      comment: 'Date of creation',
    },
    updatedAt: {
      type: sequelize.DataTypes.DATE,
      allowNull: false,
      comment: 'Date of the last update',
    },
  });

  User.beforeCreate(
    async (
      user: UserModel,
      options: sequelize.CreateOptions<UserAttributes>
    ) => {
      const hashedPassword = await Password.toHash(user.password);
      user.password = hashedPassword;
    }
  );

  return User;
}
