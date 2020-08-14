import { Result } from './result';

export abstract class UseCase<TRequest, TResponse> {
  protected abstract async executeImpl(
    params?: TRequest
  ): Promise<TResponse>;

  public async execute(params?: TRequest): Promise<Result<TResponse>> {
    try {
      const result = await this.executeImpl(params);
      return Result.success(result);
    } catch (err) {
      return Result.error(err);
    }
  }
}
