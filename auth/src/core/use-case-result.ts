export enum ResultStatus {
  SUCCESS,
  ERROR,
}

export class UseCaseResult<TResult> {
  private constructor(
    private status: ResultStatus,
    private result: TResult,
    private exception: Error
  ) {}

  get data(): TResult {
    return this.result;
  }

  get error(): Error {
    return this.exception;
  }

  public static success<TResult>(data: TResult): UseCaseResult<TResult> {
    return new UseCaseResult<TResult>(ResultStatus.SUCCESS, data, null);
  }

  public static error<TResult>(err: Error): UseCaseResult<TResult> {
    return new UseCaseResult<TResult>(ResultStatus.ERROR, null, err);
  }

  public isSuccess(): boolean {
    return this.status === ResultStatus.SUCCESS;
  }
}
