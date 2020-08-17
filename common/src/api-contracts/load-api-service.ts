import path from 'path';
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import { ApiService } from './api.service';

const API_CONTRACTS_PATH = __dirname;

export const loadApiService = (service: ApiService) => {
  const protoFileName = path.join(
    __dirname,
    service.packageName,
    service.proto
  );
  const packageDef = protoLoader.loadSync(protoFileName);
  const packageObject = grpc.loadPackageDefinition(packageDef);
  const pkg = packageObject[service.packageName];
  return (pkg as any)[service.serviceName];
};
