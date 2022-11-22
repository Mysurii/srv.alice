import type { HTTP_STATE } from './endpoint-utils';
import { HTTP_STATUS } from './endpoint-utils';

export class ApiErrorResponse {
  message: string;
  status: HTTP_STATE;

  constructor(message: string, status: HTTP_STATE) {
    this.message = message;
    this.status = status;
  }
}

// Errors
export const NOT_FOUND = (message: string) => new ApiErrorResponse(message, HTTP_STATUS.NOT_FOUND);
export const INVALID_REQUEST_PARAMETER = (message: string) => new ApiErrorResponse(message, HTTP_STATUS.BAD);
export const MISSING_BODY = (message: string) => INVALID_REQUEST_PARAMETER(message);
export const WRONG_CREDENTIALS = () => new ApiErrorResponse('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
export const BODY_NOT_PARSABLE = () => new ApiErrorResponse('bpdy is not parsable', HTTP_STATUS.UNAUTHORIZED);
