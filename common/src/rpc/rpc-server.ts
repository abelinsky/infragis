import { inject, injectable, interfaces } from 'inversify';
import * as grpc from '@grpc/grpc-js';
import asyncRetry from 'async-retry';
import { ILogger, LOGGER_TYPE } from '../utils';
import { ApiService, loadApiService } from '../api-contracts';
import { RPC_HANDLERS } from './rpc-handler';
import { EventSourcingErrorNames } from '../event-sourcing';
import { RpcStatus } from './rpc-status';

@injectable()
export class RpcServer {
  private server = new grpc.Server();
  private readonly _defaultPort = 40001;
  private readonly host = '0.0.0.0';
  private isStarted = false;

  get started() {
    return this.isStarted;
  }

  constructor(@inject(LOGGER_TYPE) private _logger: ILogger) {}

  initialize(
    services: ApiService[],
    methodsHandlerInstance: Record<string, any>,
    port: number = this._defaultPort
  ) {
    this.server.bindAsync(
      `${this.host}:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err) => {
        if (err) throw new Error(`Error occured while starting rpc server on ${this.host}:${port}`);
        this.server.start();
        this.isStarted = true;
      }
    );

    services.forEach((service) => this._addService(service, methodsHandlerInstance));
  }

  disconnect() {
    return new Promise((resolve) => {
      this.server.tryShutdown((err) => {
        if (err) this.server.forceShutdown();
        resolve();
      });
    });
  }

  private _addService(service: ApiService, methodsHandler: Record<string, any>) {
    const methods = Reflect.getMetadata(RPC_HANDLERS, service);
    const implementations: Record<string, any> = {};

    if (!methods) {
      throw new Error(
        `At least one @RpcMethod must be provided for ${service.serviceName} service`
      );
    }

    Object.keys(methods).forEach((method) => {
      implementations[method] = methods[method].bind(methodsHandler);
    });

    const grpcImpl = this._convertToGrpcImplementation(implementations);
    this.server.addService(loadApiService(service).service, grpcImpl);
  }

  private _convertToGrpcImplementation(implementation: any): grpc.UntypedServiceImplementation {
    const grpcImpl: grpc.UntypedServiceImplementation = {};
    Object.keys(implementation).forEach((key) => {
      const handler = implementation[key];
      (grpcImpl as any)[key] = this._convertPromiseToCallback(handler as any);
    });
    return grpcImpl;
  }

  private _convertPromiseToCallback(
    handler: (payload: any) => Promise<any>
  ): grpc.handleUnaryCall<any, any> {
    return async (call, callback) => {
      try {
        await asyncRetry(
          async (bail) => {
            const response = await handler(call.request).catch((err) => {
              // Retry if optimistic concurrency control has been thrown
              if (err.name && err.name === EventSourcingErrorNames.OptimisticConcurrencyIssue) {
                this._logger.warn('Concurrency issue, retry again...');
                throw err;
              }
              bail(err);
            });
            this._logger.info('RpcServer', handler?.name, response);
            callback(null, response);
          },
          { retries: 2, minTimeout: 50 }
        );
      } catch (error) {
        const errName = error.name;
        const details = error.message;
        const code = error.code || RpcStatus.UNKNOWN;
        const metadata = new grpc.Metadata();

        if (errName) metadata.add('name', errName);

        if (code === RpcStatus.UNKNOWN) {
          callback({ code, details, metadata, stack: error.stack }, null);
        } else {
          callback({ code, details, metadata }, null);
        }

        this._logger.error(error);
        const _data = {
          errName,
          code,
          timestamp: error.timestamp,
          message: error.message,
          details: error.details,
          stack: error.stack,
        };
        //  TODO send error to error service
        // await this.messageBroker.dispatchError(errorPayload);
      }
    };
  }
}

export type RpcServerFactory = (options: {
  services: ApiService[];
  methodsHandlerInstance: Record<string, any>;
  port?: number;
}) => RpcServer;

export const rpcServerFactory = (context: interfaces.Context): RpcServerFactory => {
  return ({ services, methodsHandlerInstance, port }) => {
    const server = context.container.get(RpcServer);
    server.initialize(services, methodsHandlerInstance, port);
    return server;
  };
};
