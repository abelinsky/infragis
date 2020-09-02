import { EventName } from '../../types';
import { Projector, PROJECTOR_HANDLER_TOPICS } from './projector';

/**
 * Decorator to be used in the descendants of the Projector class
 * to define a handler for the given event.
 */
export const ProjectionHandler = (eventName: string): MethodDecorator => {
  return function ProjectionDecorator(
    target: any,
    methodName: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    if (!(target instanceof Projector)) {
      throw new Error(
        '@ProjectionDecorator can be used only inside Projector class descendants.' +
          `But ${target} does not extend Projector class.`
      );
    }

    const _eventName = EventName.fromString(eventName);

    // This metadata is used in `handleEvent` method of
    // the Projector class.
    Reflect.defineMetadata(_eventName.toString(), methodName, target);

    // Remember topics that the Projector is listening to. This metadata is used
    // in `getTopics` method of the Projector class.
    const topic = _eventName.getTopic();
    const topics: string[] = Reflect.getMetadata(PROJECTOR_HANDLER_TOPICS, target) || [];
    const newTopics = topics.includes(topic) ? topics : [...topics, topic];
    Reflect.defineMetadata(PROJECTOR_HANDLER_TOPICS, newTopics, target);
  };
};
