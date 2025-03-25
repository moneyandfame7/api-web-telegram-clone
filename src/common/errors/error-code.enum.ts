import { HttpException, HttpStatus } from '@nestjs/common'

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL = 'INTERNAL',

  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  AUTH_SESSION_INVALID = 'AUTH_SESSION_INVALID',

  CHAT_ID_INVALID = 'CHAT_ID_INVALID',

  INVALID_ID = 'INVALID_ID',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class BaseError extends HttpException {
  constructor(status: number, code: ErrorCode, message: string, details?: any) {
    super({ status, code, message, details }, status, {
      cause: 'cause',
      description: 'description'
    })
  }
}

export class ValidationError extends BaseError {
  constructor(details: any) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_ERROR, 'Validation Error message', details)
  }
}
