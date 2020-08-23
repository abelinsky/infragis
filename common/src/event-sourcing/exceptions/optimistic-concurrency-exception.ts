import { ServiceException } from '../../exceptions';
import { RpcStatus } from '../../rpc';

export class OptimisticConcurrencyException extends ServiceException {
  code = RpcStatus.ABORTED;

  constructor(
    eventName: string,
    aggregateId: string,
    expectedVersion: number,
    lastEventVersion: number,
    lastEventId: string
  ) {
    super('Optimistic concurrency problem', {
      eventName,
      aggregateId,
      expectedVersion,
      lastEventVersion,
      lastEventId,
    });
  }
}
