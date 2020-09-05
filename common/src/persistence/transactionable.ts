import { ITransaction } from './transaction';

/**
 * Interface for providing transaction mechanisms.
 */
export interface ITransactionable {
  /**
   * Managed transaction.
   * Runs a set of operations within a single transaction.
   * Implementing class will automatically rollback the transaction to
   * the pre-transaction state if any error is thrown, or commit the
   * transaction otherwise. If Continuation Local Storage is enabled, all queries
   * within the transaction callback can automatically receive the transaction object.
   * @param runner Runner that contains the operations to be executed in the transaction.
   */
  transaction<T>(runner: (transaction: ITransaction) => Promise<T>): Promise<T>;

  /**
   * Unmanaged transactions.
   * Committing and rolling back the transaction should be done manually by the user
   * This method begins transaction.
   * @returns New {@link Transaction} instance.
   */
  beginTransaction(): Promise<ITransaction>;

  /**
   * Rollbacks any queries of the transaction to the pre-transaction state.
   * @param transaction {@link Transaction} instance.
   */
  rollbackTransaction(transaction: ITransaction): Promise<void>;

  /**
   * Commits the transaction.
   * @param transaction {@link Transaction} instance.
   */
  commitTransaction(transaction: ITransaction): Promise<void>;
}
