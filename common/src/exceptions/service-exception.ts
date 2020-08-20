import { RpcStatus } from '../rpc';

export abstract class ServiceException extends Error {
  abstract code: RpcStatus;

  public occuredOn = new Date().toISOString();

  constructor(public message: string, public details?: any) {
    super(message);
  }
}
