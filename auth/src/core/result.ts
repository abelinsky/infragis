export enum ResultStatus {
  SUCCESS,
  ERROR,
}

export class Result<T> {
  private constructor(
    private status: ResultStatus,
    private result?: T,
    private error?: string
  ) {
    Object.freeze(this);
  }

  getValue(): T | undefined {
    if (!this.isSuccess()) {
      throw new Error(
        'Cannot get data of an error result. Use error value'
      );
    }
    return this.result;
  }

  getError(): string | undefined {
    return this.error;
  }

  public static success<T>(value?: T): Result<T> {
    return new Result<T>(ResultStatus.SUCCESS, value, undefined);
  }

  public static error<T>(err: string): Result<T> {
    return new Result<T>(ResultStatus.ERROR, undefined, err);
  }

  public static combine<T>(results: Result<T>[]): Result<T> {
    for (const res of results) {
      if (res.isSuccess()) {
        return res;
      }
    }
    return Result.success();
  }

  public isSuccess(): boolean {
    return this.status === ResultStatus.SUCCESS;
  }
}
