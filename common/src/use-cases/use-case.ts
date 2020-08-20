/**
 * Base class for use caseses, implemented in services.
 * It's assumed here that one UseCase implements one of
 * the methods of @param ApiService.
 */
export interface IUseCase<TApiService, TMethod extends keyof TApiService> {
  execute: TApiService[TMethod];
}
