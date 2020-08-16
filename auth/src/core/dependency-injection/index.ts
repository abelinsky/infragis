import 'reflect-metadata';
import { Container } from 'inversify';

/**
 * `skipBaseClassChecks: true`
 * https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md#workaround-e-skip-base-class-injectable-checks
 * is needed because of the abstract `EventRepository` class
 */
const container = new Container({ skipBaseClassChecks: true });

export const DI = {
  registerProviders: (...providers: any[]): void =>
    providers.forEach((p) => container.bind(p).toSelf()),

  registerSingleton: (identifier: any, provider?: any): void => {
    provider
      ? container.bind(identifier).to(provider).inSingletonScope()
      : container.bind(identifier).toSelf().inSingletonScope();
  },
  registerSingletons: (...providers: any[]) =>
    providers.forEach((p) => container.bind(p).to(p).inSingletonScope()),

  bootstrap: (provider: any): any => container.get(provider),

  getContainer: (): Container => container,
};
