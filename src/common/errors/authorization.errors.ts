import { BaseError } from './error-code.enum'

export class UnauthorizedError extends BaseError {
  constructor(details?: any) {
    super(401, 'UNAUTHORIZED', 'Unauthorized message', details)
  }
}
export class ValidationError extends BaseError {
  constructor(details: any) {
    super(422, 'VALIDATION_ERROR', 'Validation Error message', details)
  }
}
