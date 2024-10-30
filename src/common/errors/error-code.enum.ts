import { HttpException } from '@nestjs/common'

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL = 'INTERNAL',

  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  AUTH_SESSION_INVALID = 'AUTH_SESSION_INVALID'
}

interface BaseErrorStructure {
  status: number
  code: string
  message: string
  details: any
}

export class BaseError extends HttpException {
  constructor(status: number, code: string, message: string, details?: any) {
    super({ status, code, message, details }, status, {
      cause: 'cause',
      description: 'description'
    })
  }
}

export class ValidationError extends BaseError {
  constructor(details: any) {
    super(422, 'VALIDATION_ERROR', 'Validation Error message', details)
  }
}
