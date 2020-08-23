import { ServiceException } from '../../exceptions';
import { RpcStatus } from '../../rpc';
import { StoredEvent } from '../core/stored-event';
import { StreamVersion } from '../core/stream-version';

export class ReplayVersionMismatchException extends ServiceException {
  code: RpcStatus = RpcStatus.INTERNAL;

  constructor(event: StoredEvent, aggregateVersion: StreamVersion) {
    super(`Version mismatch occured while replaying events:
    Aggregate has version ${aggregateVersion.toNumber()}.
    Replayed event  has version ${event.version}.
    `);
  }
}
