export type HttpResponse = {
  statusCode: number;
  body: unknown;
};

export type HttpRequest = {
  body?: unknown;
  headers?: unknown;
  params?: unknown;
};

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error,
});

export const forbidden = (error: Error): HttpResponse => ({
  statusCode: 403,
  body: error,
});

// export const unauthorized = (): HttpResponse => ({
//   statusCode: 401,
//   body: new UnauthorizedError(),
// });

// export const serverError = (error: Error): HttpResponse => ({
//   statusCode: 500,
//   body: new ServerError(error.stack),
// });

export const ok = (
  data: unknown,
  statusCode: number = 200
): HttpResponse => ({
  statusCode,
  body: data,
});

export const noContent = (): HttpResponse => ({
  statusCode: 204,
  body: null,
});
