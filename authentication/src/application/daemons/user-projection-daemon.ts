import { inject } from 'inversify';
import { DOMESTIC_USER_PROJECTOR } from '@/infrastructure';
import { ApplicationDaemon, Daemon, ILogger, IProjector, LOGGER_TYPE } from '@infragis/common';

@ApplicationDaemon()
export class UserProjectionDaemon extends Daemon {
  name: string = 'user-projecting-d';

  constructor(
    @inject(DOMESTIC_USER_PROJECTOR) private userProjector: IProjector,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {
    super();
  }

  /**
   * Starts listening for and projecting DomainEvents of the {@link User} aggregate.
   */
  async start(): Promise<boolean> {
    this.userProjector.start();
    this.logger.debug('Starting projecting user events into query model...');
    return true;
  }

  /**
   * Stops projecting.
   */
  async stop(): Promise<void> {
    this.userProjector.stop();
  }
}
