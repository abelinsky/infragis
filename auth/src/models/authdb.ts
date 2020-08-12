import * as sequelize from 'sequelize';
import { userFactory, UserStaticModel } from './user';

class AuthDatabase {
  private _sequelize?: sequelize.Sequelize;
  private _userModel?: UserStaticModel;

  get client(): sequelize.Sequelize {
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
  get User(): UserStaticModel {
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
    options?: sequelize.Options
  ): Promise<void> {
    this._sequelize = new sequelize.Sequelize(
      database,
      username,
      password,
      options
    );

    this._initDb();

    return this.client.authenticate();
  }

  /**
   * Creates models
   */
  _initDb() {
    this._userModel = userFactory(this.client);

    // Sync models
    this.client.sync();
  }
}

// Create singleton for interacting with db
export const authDb = new AuthDatabase();
