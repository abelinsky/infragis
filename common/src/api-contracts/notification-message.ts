import { inject } from 'inversify';
import * as path from 'path';
import { StoredEvent } from '../event-sourcing';
import { EventName } from '../types';
import * as protobuf from 'protobufjs';
import { LOGGER_TYPE, ILogger } from '../utils';

export abstract class NotificationMessage {
  protected abstract name: string;
  protected abstract package: string;
  protected abstract protofile: string;

  @inject(LOGGER_TYPE) logger!: ILogger;

  encode(event: StoredEvent): Buffer {
    const Message = this.getFromProtoDefinition();
    const eventName = EventName.fromString(event.name);
    const message = Message.create({ ...event, data: { [eventName.eventName]: event.data } });
    return Message.encode(message).finish() as Buffer;
  }

  decode(buffer: Buffer, eventName: EventName): StoredEvent {
    const Message = this.getFromProtoDefinition();

    try {
      const decodedMessage: StoredEvent = Object(Message.decode(buffer));
      const data = (decodedMessage.data as any)[eventName.eventName];
      return { ...decodedMessage, data };
    } catch (err) {
      if (err instanceof protobuf.util.ProtocolError) {
        this.logger.error(
          `Could not decode message: ${err.instance.toJSON()}, some fields are lost.` +
            `Caused by ${err.message} in ${err.message}`
        );
      } else {
        this.logger.error('Error decoding message: wire format is invalid.');
      }
      throw err;
    }
  }

  private getFromProtoDefinition(): protobuf.Type {
    const filename = path.join(__dirname, this.package, this.protofile);
    const root = protobuf.loadSync(filename);
    return root.lookupType(this.name);
  }
}
