import { UseCaseResult } from './use-case-result';

export abstract class UseCase<TRequest, TResponse> {
  protected abstract async executeImpl(
    params?: TRequest
  ): Promise<TResponse>;

  public async execute(
    params?: TRequest
  ): Promise<UseCaseResult<TResponse>> {
    try {
      const result = await this.executeImpl(params);
      return UseCaseResult.success(result);
    } catch (err) {
      return UseCaseResult.error(err);
    }
  }
}
