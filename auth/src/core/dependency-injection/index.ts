import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

const container = new Container();

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
