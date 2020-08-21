import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';

export class OptimisticConcurrencyControlException extends ServiceException {
  code = RpcStatus.ABORTED;

  constructor(
    eventStore: string,
    aggregateId: string,
    lastVersion: number,
    bookmark: number,
    lastEventId: string
  ) {
    super('Optimistic concurrency problem', {
      eventStore,
      aggregateId,
      lastVersion,
      bookmark,
      lastEventId,
    });
  }
}
