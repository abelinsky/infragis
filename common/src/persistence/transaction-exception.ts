import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';

export class TransactionException extends ServiceException {
  code = RpcStatus.CANCELLED;

  constructor(source: Error) {
    super(`Failed to process a database transaction: ${source}`);
  }
}
