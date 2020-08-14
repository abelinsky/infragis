import { Sequelize, Model, DataTypes, ModelCtor } from 'sequelize';
import { Password } from '../../../../domain/services/password';

// Attributes specified when creating a new instance of the model.
export interface UserAttributes {
  id?: string; // automatically set by Sequelize
  email: string;
  password: string;
  readonly createdAt?: Date; // automatically set by Sequelize
  readonly updatedAt?: Date; // automatically set by Sequelize
}

interface UserInstance extends Model<UserAttributes>, UserAttributes {}

export type UserModel = ModelCtor<UserInstance>;

export default (sequelize: Sequelize): UserModel => {
  const UserModel = sequelize.define<UserInstance>(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Id of the instance',
      },
      email: {
        type: DataTypes.STRING(),
        allowNull: false,
        unique: true,
        comment: 'Unique email',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: null,
        comment: 'Users password',
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
      ],
      version: true,
      comment: 'Stores users registration info',
    }
  );

  UserModel.beforeCreate(async (user: UserInstance) => {
    const hashedPassword = await Password.toHash(user.password);
    user.password = hashedPassword;
  });

  return UserModel;
};
