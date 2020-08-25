/**
 * Application service that runs silently
 * and handles technical tasks behind the scenes
 */

import { decorate, injectable } from 'inversify';

export abstract class Daemon {
  abstract readonly name: string;
  abstract start(): Promise<boolean>;
  abstract stop(): Promise<void>;
}

/**
 * Decorator for {@link ServiceDaemon}.
 */

export const DAEMONS_METADATA = '__DaemonsList___';

export const ApplicationDaemon = () => {
  return function ApplicationDaemonDecorator<T extends new (...args: any[]) => any>(target: T) {
    if (!(target.prototype instanceof Daemon)) {
      throw new Error(
        '@DaemonDecorator can only be applied to ServiceDaemon class.' +
          `But ${target} does not extend it.`
      );
    }

    decorate(injectable(), target);

    // We need to create an array that contains all daemons
    // in the application, the metadata cannot be
    // attached to a particular daemon. It needs to be attached to a global.
    // We attach metadata to the Reflect object itself to avoid
    // declaring additonal globals. Also, the Reflect is avaiable
    // in both node and web browsers.
    const previousData = Reflect.getMetadata(DAEMONS_METADATA, Reflect) || [];
    const newData = [target, ...previousData];
    Reflect.defineMetadata(DAEMONS_METADATA, newData, Reflect);
  };
};

export function getDaemonsCtrsFromMetadata<T extends Daemon>(): Array<new () => T> {
  const daemons = Reflect.getMetadata(DAEMONS_METADATA, Reflect) || [];
  return daemons;
}
