import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

/**
 * `skipBaseClassChecks: true` for abstract classes
 * https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md#workaround-e-skip-base-class-injectable-checks
 */
const container = new Container({ skipBaseClassChecks: true });

export const DI = {
  registerProviders: (...providers: any[]): void =>
    providers.forEach((p) => container.bind(p).toSelf()),

  registerFactory: (
    identifier: any,
    factory: (context: interfaces.Context) => any
  ) => container.bind(identifier).toFactory(factory),

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
