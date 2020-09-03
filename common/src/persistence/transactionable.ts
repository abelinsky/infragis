/**
 * Interface for providing transaction mechanisms.
 */
export interface ITransactionable {
  /**
   * Runs a set of operations within a single transaction. All queries within a transaction
   * run the entire set of queries as a single unit of work. Any failure will mean the
   * rollback ofany queries executed on that transaction to the pre-transaction state.
   * @param runner Runner that contains the operations to be executed in the transaction.
   */
  transaction<T>(runner: () => Promise<T>): Promise<T>;

  /**
   * Begins transaction.
   * An alternative to the `transaction` method. Gives more control over handling a transaction.
   * Assumes handling the transaction manually. Note that this method does not actually start
   * the transaction.
   */
  beginTransaction(): Promise<void>;

  /**
   * Rollbacks any queries of the transaction to the pre-transaction state.
   */
  rollbackTransaction(): Promise<void>;

  /**
   * Commits the transaction.
   */
  commitTransaction(): Promise<void>;
}
