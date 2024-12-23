import { BaseError, ErrorCode } from './error-code.enum'

export class UnauthorizedError extends BaseError {
  constructor(details?: any) {
    super(401, ErrorCode.UNAUTHORIZED, 'Unauthorized message', details)
  }
}
