import { handleBidiStreamingCall } from '@grpc/grpc-js';

export interface StoredEvent<T = Record<any, any>> {
  id: string;
  streamId: string;
  version: number;
  name: string;
  data: T;
  insertedAt: string;
  sequence: number;
}
