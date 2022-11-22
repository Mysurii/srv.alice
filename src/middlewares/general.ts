import type { Request, Response, NextFunction } from 'express';
import type { HTTP_STATE } from '../utils/endpoint-utils';
import { HTTP_STATUS, sendError } from '../utils/endpoint-utils';
import { ApiErrorResponse, BODY_NOT_PARSABLE, NOT_FOUND } from '../utils/exceptions';

export function bodyCheck(error: { expose: boolean; statusCode: number; status: number; body: string; type: string }, _request: Request, response: Response, next: NextFunction) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return next(BODY_NOT_PARSABLE());
  }

  next();
}

export async function errorHandler(error: unknown, _: Request, response: Response, next: NextFunction): Promise<void> {
  console.log(error);
  let message: string;
  let status: HTTP_STATE;

  if (error instanceof ApiErrorResponse) {
    message = error.message;
    status = error.status;
  } else {
    message = 'Something went wrong on the server...';
    status = HTTP_STATUS.INTERNAL_SERVER;
  }

  return sendError(response, status, message);
}
