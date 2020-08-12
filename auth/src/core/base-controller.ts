import express, { Request, Response } from 'express';
import { CustomError, InternalServerError } from '@infragis/common';

export abstract class BaseController {
  protected abstract executeImpl(
    req: Request,
    res: Response
  ): Promise<void>;

  public async execute(req: Request, res: Response): Promise<void> {
    await this.executeImpl(req, res);

    // try {
    //   await this.executeImpl(req, res);
    // } catch (err) {
    //   console.error(err);
    //   this.fail(new InternalServerError('Something went wrong'));
    // }
  }

  public ok<T>(res: Response, dto?: T, statusCode: number = 201): void {
    if (!!dto) {
      res.status(statusCode).send(dto);
    } else {
      res.sendStatus(statusCode);
    }
  }

  protected fail(error: Error | CustomError | string): void {
    throw new InternalServerError(error.toString());
  }
}
