import { inject, postConstruct, interfaces } from 'inversify';
import * as http from 'http';
import { ILogger, LOGGER_TYPE } from '../logger';
import { Daemon, getDaemonsCtrsFromMetadata } from './application-daemon';
import { DI } from '../../dependency-injection';

const DAEMON_TYPE = Symbol('DAEMON');

export abstract class ServiceServer {
  abstract handleShutdown(): Promise<void>;
  abstract healthcheck(): Promise<boolean>;

  private errorTypes = ['unhandledRejection', 'uncaughtException'];
  private signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  @inject(LOGGER_TYPE) private _logger!: ILogger;
  private applicationDaemons: Daemon[] = [];

  constructor(
    private container: interfaces.Container = DI.getContainer(),
    private readonly port = 3000
  ) {
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

    this.signalTraps.forEach((signal) => {
      process.on(signal, async () => {
        this._logger.warn('Exiting: ', signal);
        await this.shutdown();
        process.kill(process.pid, signal);
      });
    });
  }

  @postConstruct()
  async initialize() {
    this.registerDaemons();
    await this.startDaemons();
    this._logger.info(
      `Server has been initialized ${
        this.healthcheck() ? 'and is running' : 'but something went wrong'
      }...`
    );
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
      this._logger.info(`   starting daemon ${daemon.name}...`);
      await daemon.start();
    }

    this._logger.info('daemons have been started...');
  }

  private async stopDaemons() {
    for (const daemon of this.applicationDaemons) {
      await daemon.stop();
      this._logger.info(`daemon ${daemon.name} stopped...`);
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
