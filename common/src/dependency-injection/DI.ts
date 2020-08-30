import { Container, interfaces } from 'inversify';
import { modules } from './default-bindings';
import { decorateThirdPartyClasses } from './third-party';

/**
 * `skipBaseClassChecks: true` for abstract classes
 * https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md#workaround-e-skip-base-class-injectable-checks
 */
//const container = new Container({ skipBaseClassChecks: true });

const container = new Container();
decorateThirdPartyClasses();

export const DI = {
  applyDefaultBindings: (): void => container.load(...modules),

  registerProviders: (...providers: any[]): void =>
    providers.forEach((p) => container.bind(p).toSelf()),
  registerIdentifiedProvider: (identifier: any, provider: any): any =>
    container.bind(identifier).to(provider),

  registerFactory: (identifier: any, factory: (context: interfaces.Context) => any) =>
    container.bind(identifier).toFactory(factory),

  registerSingleton: (identifier: any, provider?: any): void => {
    provider
      ? container.bind(identifier).to(provider).inSingletonScope()
      : container.bind(identifier).toSelf().inSingletonScope();
  },
  registerSingletons: (...providers: any[]) =>
    providers.forEach((p) => container.bind(p).to(p).inSingletonScope()),

  overrideProvider: (provider: any, newProvider: any) => {
    container.unbind(provider);
    container.bind(provider).to(newProvider);
  },

  loadModules: (...modules: interfaces.ContainerModule[]): void => container.load(...modules),
  unloadModules: (...modules: interfaces.ContainerModule[]): void => container.unload(...modules),

  getContainer: (): Container => container,
  bootstrap: (provider: any): any => container.get(provider),
};
