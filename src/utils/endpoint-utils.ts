import { NOT_FOUND } from './exceptions';
import type { Request, Response } from 'express';

export type HTTP_STATE = {
  code: number;
  status: string;
};

type HTTP_STATUS_CODES = 'ok' | 'created' | 'no_content' | 'bad' | 'unauthorized' | 'not_found' | 'conflict' | 'internal_server';

export const HTTP_STATUS: Record<Uppercase<HTTP_STATUS_CODES>, HTTP_STATE> = {
  OK: { code: 200, status: 'OK' },
  CREATED: { code: 201, status: 'Created' },
  NO_CONTENT: { code: 204, status: 'No Content' },
  BAD: { code: 400, status: 'Bad Request' },
  UNAUTHORIZED: { code: 401, status: 'Unauthorized' },
  NOT_FOUND: { code: 404, status: 'Not Found' },
  CONFLICT: { code: 409, status: 'Conflict' },
  INTERNAL_SERVER: { code: 500, status: 'Internal Server Error' },
};

export function sendResponse(response: Response, status: HTTP_STATE, responseBody?: unknown): void {
  response.status(status.code).send(responseBody);
}

export function sendError(response: Response, status: HTTP_STATE, message: string) {
  const responseMessage = {
    status: status.code,
    error: status.status,
    message: message,
  };

  sendResponse(response, status, responseMessage);
}

export function getUser(request: Request) {
  const user = request.user;

  if (typeof user === 'undefined') {
    throw NOT_FOUND('User not found');
  }

  return user;
}
