export const messageMap = new Map();

/**
 * Name of the event in the format: serviceName.events.aggregateName or aggregateName:method
 */
export const Notification = (topic: string) => {
  return function NotificationDecorator(target: any) {
    const regex = new RegExp(/^[A-Z]+\.events\.[A-Z]+$/i);
    if (!regex.exec(topic)) {
      throw new Error(
        `Invalid topic name in Notification decorator for ${target} (does not match the pattern serviceName.events.aggregateName)`
      );
    }

    messageMap.set(topic, new target());
  };
};
