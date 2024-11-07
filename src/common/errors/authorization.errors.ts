import { BaseError } from './error-code.enum'

export class UnauthorizedError extends BaseError {
  constructor(details?: any) {
    super(401, 'UNAUTHORIZED', 'Unauthorized message', details)
  }
}
