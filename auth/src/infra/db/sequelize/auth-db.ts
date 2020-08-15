import { Sequelize, Options } from 'sequelize';
import userModelFactory, { UserModel } from './models/user';
import { IModels } from './imodels';

class AuthDatabase implements IModels {
  private _sequelize?: Sequelize;
  private _userModel?: UserModel;

  get client(): Sequelize {
    if (!this._sequelize) {
      throw new Error(
        'Cannot access sequelize instance before connecting'
      );
    }
    return this._sequelize;
  }

  /**
   * Returns User model
   */
  get User(): UserModel {
    if (!this._userModel) {
      throw new Error(
        'Cannot access User Model before connecting to database'
      );
    }

    return this._userModel;
  }

  /**
   * Connects to Postgres database and returns Promise of successful connection
   * @param database Database name
   * @param username User name
   * @param password User password
   * @param options Connection options
   */
  connect(
    database: string,
    username: string,
    password?: string,
    options?: Options
  ): Promise<void> {
    this._sequelize = new Sequelize(database, username, password, options);
    //this._sequelize = new Sequelize('postgres://admin:admin123@db:5432/authdb')
    this._initDb();
    return this.client.authenticate();
  }

  /**
   * Creates models
   */
  _initDb() {
    this._userModel = userModelFactory(this.client);

    // Sync models
    this.client.sync();
  }
}

// Create singleton for interacting with db
export const authDb = new AuthDatabase();
