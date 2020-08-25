import { StoredEvent } from '../event-sourcing';
import { EventName } from '../types';
import { NotificationMessage } from './notification-message';
import { messageMap } from './notification-message-decorator';
import { MessagePackingException } from './message-packing-exception';

export function encodeEventToNotification(event: StoredEvent) {
  const topic = EventName.fromString(event.name).getTopic();
  const msg = getMessage(topic);
  return msg.encode(event);
}

export function decodeEventFromNotification(buffer: Buffer, eventName: EventName): StoredEvent {
  const msg = getMessage(eventName.getTopic());
  return msg.decode(buffer, eventName);
}

function getMessage(topic: string): NotificationMessage {
  const message = messageMap.get(topic);
  if (!message) {
    throw new MessagePackingException(topic);
  }
  return message;
}
