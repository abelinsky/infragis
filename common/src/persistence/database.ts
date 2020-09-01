import { DatabaseConnectionCredentials } from './connection-credentials';

/**
 * Base interface for working with service's database.
 */
export interface IDatabase {
  /**
   * Initializes database.
   * @param credentials Database connection credentials.
   */
  initialize(credentials: DatabaseConnectionCredentials): void;

  /**
   * Applies sets of schema changes to upgrade a database.
   * @param directory A relative path to the directory containing the migration files. Can be an array of paths.
   */
  migrate(directory: string): Promise<void>;

  /**
   * Populates database with data.
   * @param directory A relative path to the directory containing the seed files. Can be an array of paths.
   */
  seed(directory: string): Promise<void>;

  /**
   * Disconnects from database.
   */
  closeConnection(): Promise<void>;
}

/**
 * Common factory fro database initialization.
 */
export type DatabaseFactory = (connectionCredentials: DatabaseConnectionCredentials) => IDatabase;
