import { QueryInterface, DataTypes } from 'sequelize';
import { tableName as usersTableName } from '../../src/models/user';

/**
 * function that sequelize-cli runs if you want to add this migration to your database
 * */
export async function up(query: QueryInterface) {
  try {
    return query.createTable(usersTableName, {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
        comment: "User's password",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date of creation',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date of the last update',
      },
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * function that sequelize-cli runs if you want to remove this migration from your database
 * */
export async function down(query: QueryInterface) {
  try {
    return query.dropTable(usersTableName);
  } catch (e) {
    return Promise.reject(e);
  }
}
