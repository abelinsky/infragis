import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';

export class MessagePackingException extends ServiceException {
  code = RpcStatus.INVALID_ARGUMENT;

  constructor(topic: string) {
    super(
      `Message packer for topic ${topic} not found. Use @PackableMessage to define class responsible for packing.`
    );
  }
}
