import { injectable } from 'inversify';
import { ServiceServer } from '@infragis/common';

@injectable()
export class UserServer extends ServiceServer {
  constructor() {
    super();
  }

  async handleShutdown(): Promise<void> {
    // nothing to do here
  }

  async healthcheck(): Promise<boolean> {
    return true;
  }
}
