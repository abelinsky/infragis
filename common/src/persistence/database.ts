import { DatabaseConnectionCredentials } from './connection-credentials';

export interface IDatabase {
  initialize(credentials: DatabaseConnectionCredentials): void;

  migrate(directory: string): Promise<void>;

  seed(directory: string): Promise<void>;

  closeConnection(): Promise<void>;
}

export type DatabaseFactory = (connectionCredentials: DatabaseConnectionCredentials) => IDatabase;
