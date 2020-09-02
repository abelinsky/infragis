import * as http from 'http';
import { inject, injectable, interfaces, postConstruct } from 'inversify';

import { DI } from '../../dependency-injection';
import { LOGGER_TYPE } from '../../dependency-injection';
import { ILogger } from '../logger';

import { Daemon, getDaemonsCtrsFromMetadata } from './application-daemon';
import { getJobCtrsFromMetadata, Job } from './job';

const DAEMON_TYPE = Symbol.for('DAEMON');
const JOB_TYPE = Symbol.for('Job');

@injectable()
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
    // Execute Application Jobs
    this.registerJobs();
    await this.executeJobs();

    // Start Daemons
    this.registerDaemons();
    await this.startDaemons();

    this._logger.success('Server has been initialized');

    this.healthcheck()
      ? this._logger.success('🚀  Server is running')
      : this._logger.failure('Server healthcheck failed');
  }

  private registerJobs(): void {
    const jobs = getJobCtrsFromMetadata();
    for (const ctr of jobs) {
      const name = ctr.name;
      if (this.container.isBoundNamed(JOB_TYPE, name)) {
        throw new Error(`Two jobs cannot have the same name: ${name}`);
      }
      this.container.bind(JOB_TYPE).to(ctr).whenTargetNamed(name);
    }
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

  private async executeJobs(): Promise<void> {
    let jobs: Job[] = [];
    if (this.container.isBound(JOB_TYPE)) {
      jobs = this.container.getAll<Job>(JOB_TYPE);
    }
    if (!jobs.length) return;

    this._logger.info(`Performing ${jobs.length} job(s) execution...`);
    for (const job of jobs) {
      this._logger.info(`Executing ${job.name} job...`);
      const result = await job.execute();
      result
        ? this._logger.failure(`✗ Failed to execute ${job.name}.`)
        : this._logger.success(`√ Job ${job.name} successfully finished.`);
    }
  }

  private async startDaemons(): Promise<void> {
    if (this.container.isBound(DAEMON_TYPE)) {
      this.applicationDaemons = this.container.getAll<Daemon>(DAEMON_TYPE);
    }
    if (!this.applicationDaemons.length) return;

    this._logger.info(`Starting ${this.applicationDaemons.length} daemons(s) ...`);
    for (const daemon of this.applicationDaemons) {
      this._logger.info(`   starting daemon ${daemon.name}...`);
      await daemon.start();
    }
    this._logger.success(
      `${this.applicationDaemons.length} daemons have been started successfully...`
    );
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
