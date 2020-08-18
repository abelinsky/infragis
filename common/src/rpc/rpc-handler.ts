import { ApiService } from '../api-contracts';

export const RPC_HANDLERS = '__rpcHandlers__';

export const RpcHandler = (apiService: ApiService) => {
  return function HandlerDecorator(
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const previousMetadata = Reflect.getMetadata(RPC_HANDLERS, apiService);
    Reflect.defineMetadata(
      RPC_HANDLERS,
      { ...previousMetadata, [methodName]: descriptor.value },
      apiService
    );
  };
};
