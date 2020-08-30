export interface PostgresConnectionConfig {
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;
  tableName: string;
}
