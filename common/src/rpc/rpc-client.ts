import * as grpc from '@grpc/grpc-js';
import { injectable, interfaces, inject } from 'inversify';
import { ApiService } from '../api-contracts';
import { loadApiService } from '../api-contracts';
import { ILogger, LOGGER_TYPE } from '../utils';

@injectable()
export class RpcClient<T> {
  client: T = {} as any;

  private readonly _defaultPort = 40001;
  private _grpcClient: grpc.Client;

  constructor(@inject(LOGGER_TYPE) private _logger: ILogger) {}

  initialize(
    host: string,
    service: ApiService,
    port: number = this._defaultPort
  ) {
    const serviceDef = loadApiService(service);
    this._grpcClient = new serviceDef(
      `${host}:${port}`,
      grpc.credentials.createInsecure()
    );

    this._attachMethods(Object.keys(serviceDef.service));
  }

  /**
   * Attaches methods to `client` and wraps them as `Promise` for grpc
   * unary calls.
   * @param methodsNames Names of methods to be attached.
   */
  private _attachMethods(methodsNames: string[]) {
    methodsNames.forEach((methodName) => {
      (this.client as any)[methodName] = (payload: any) => {
        return new Promise((resolve, reject) => {
          this._logger.info('Called in rpc client', methodName, payload);
          const method: grpc.requestCallback<any> = (this
            ._grpcClient as any)[methodName](
            payload,
            (err: grpc.ServiceError, response: any) => {
              if (err) {
                reject(err);
              }
              resolve(response);
            }
          );
          (this._grpcClient as any)[methodName].bind(method);
        });
      };
    });
  }
}

export type RpcClientFactory = (options: {
  host: string;
  service: ApiService;
  port?: number;
}) => RpcClient<any>;

export const rpcClientFactory = (
  context: interfaces.Context
): RpcClientFactory => {
  return ({ host, service, port }) => {
    const client = context.container.get(RpcClient);
    client.initialize(host, service, port);
    return client;
  };
};
