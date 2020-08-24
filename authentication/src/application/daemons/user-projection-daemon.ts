import { inject } from 'inversify';
import { Daemon, IProjector, LOGGER_TYPE, ILogger, ApplicationDaemon } from '@infragis/common';
import { DOMESTIC_USER_PROJECTOR } from '@/infrastructure';

@ApplicationDaemon()
export class UserProjectionDaemon extends Daemon {
  constructor(
    @inject(DOMESTIC_USER_PROJECTOR) private userProjector: IProjector,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {
    super();
  }

  async start(): Promise<boolean> {
    this.logger.info('============== UserProjectionDaemon started! ===================');
    return true;
  }

  async stop(): Promise<void> {
    // nothing to do here
  }
}
