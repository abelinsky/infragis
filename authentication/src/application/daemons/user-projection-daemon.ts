import { DOMESTIC_USER_PROJECTOR } from '@/infrastructure';
import { ApplicationDaemon, Daemon, ILogger, IProjector, LOGGER_TYPE } from '@infragis/common';
import { inject } from 'inversify';

@ApplicationDaemon()
export class UserProjectionDaemon extends Daemon {
  name: string = 'usr-projection-d';

  constructor(
    @inject(DOMESTIC_USER_PROJECTOR) private userProjector: IProjector,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {
    super();
  }

  async start(): Promise<boolean> {
    this.userProjector.start();
    this.logger.debug('Starting projecting user events into query model...');
    return true;
  }

  async stop(): Promise<void> {
    this.userProjector.stop();
  }
}
