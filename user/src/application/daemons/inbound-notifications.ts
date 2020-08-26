import { inject } from 'inversify';
import { ApplicationDaemon, Daemon, ILogger, LOGGER_TYPE } from '@infragis/common';
import { InboundNotificationHandler } from './inbound-notification-handler';

/**
 * Listens for inbound events from other services
 * and performs operations based on them.
 */
@ApplicationDaemon()
export class InboundNotifications extends Daemon {
  name: string = 'inbound-notifications-d';

  constructor(
    @inject(InboundNotificationHandler) private inboundDispather: InboundNotificationHandler,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {
    super();
  }

  async start(): Promise<boolean> {
    // already stared listening by injecting `inboundDispather`.
    return true;
  }

  async stop(): Promise<void> {
    this.inboundDispather.disconnect();
  }
}
