import { TransactionId } from '../types';

/**
 * Transaction interface.
 */
export interface ITransaction {
  /**
   * IUnique transaction Id.
   */
  id: TransactionId;

  /**
   * Transaction object.
   */
  trx: {
    isCompleted: () => boolean;
    commit: (...args: any[]) => any;
    rollback: (...args: any[]) => any;
  };
}
