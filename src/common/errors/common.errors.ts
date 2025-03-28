import { BaseError, ErrorCode } from './error-code.enum'

export class InvalidEntityIdError extends BaseError {
  public constructor(details?: any) {
    super(400, ErrorCode.INVALID_ID, 'The provided entity ID is invalid.', details)
  }
}
