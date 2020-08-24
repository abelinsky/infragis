import { interfaces } from 'inversify';
import * as http from 'http';
import { inject, postConstruct } from 'inversify';
import { ILogger, LOGGER_TYPE } from '../logger';
import { Daemon, getDaemonsCtrsFromMetadata } from './application-daemon';

const DAEMON_TYPE = Symbol('DAEMON');

export abstract class ServiceServer {
  abstract handleShutdown(): Promise<void>;
  abstract healthcheck(): Promise<boolean>;

  private errorTypes = ['unhandledRejection', 'uncaughtException'];
  private signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  @inject(LOGGER_TYPE) private _logger!: ILogger;
  private applicationDaemons: Daemon[] = [];

  constructor(private container: interfaces.Container, private readonly port = 3000) {
    http
      .createServer(async (req, res) => {
        const isAlive = await this.healthcheck();
        res.writeHead(isAlive ? 200 : 500).end();
      })
      .listen();

    this.errorTypes.forEach((errorType) => {
      process.on(errorType, async (error) => {
        this._logger.warn('Exiting: ', errorType);
        this._logger.error(error);
        await this.shutdown();
      });
    });

    this.signals.forEach((signal) => {
      process.on(signal, async () => {
        this._logger.warn('Exiting: ', signal);
        await this.shutdown();
      });
    });
  }

  @postConstruct()
  async initialize() {
    this.registerDaemons();
    await this.startDaemons();
  }

  private registerDaemons(): void {
    const daemonCtrs = getDaemonsCtrsFromMetadata();
    for (const ctr of daemonCtrs) {
      const name = ctr.name;

      if (this.container.isBoundNamed(DAEMON_TYPE, name)) {
        throw new Error(`Two daemons cannot have the same name: ${name}`);
      }

      this.container.bind(DAEMON_TYPE).to(ctr).whenTargetNamed(name);
    }
  }

  private async startDaemons(): Promise<void> {
    if (this.container.isBound(DAEMON_TYPE)) {
      this.applicationDaemons = this.container.getAll<Daemon>(DAEMON_TYPE);
    }

    for (const daemon of this.applicationDaemons) {
      await daemon.start();
    }
  }

  private async stopDaemons() {
    for (const daemon of this.applicationDaemons) {
      await daemon.stop();
    }
  }

  private async shutdown() {
    try {
      this._logger.warn('Starting to shutdown server ...');
      await this.stopDaemons();
      await this.handleShutdown();
      this._logger.info('Server was stopped successfully! Goodbye!');
      process.exit(0);
    } catch (error) {
      this._logger.warn('An error occured while stopping the server ...');
      this._logger.error(error);
      this._logger.info('Goodbye!');
      process.exit(1);
    }
  }
}
