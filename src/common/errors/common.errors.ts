import { BaseError } from './error-code.enum'

export class InvalidEntityIdError extends BaseError {
  public constructor(details?: any) {
    super(401, 'INVALID_ID', 'The provided entity ID is invalid.', details)
  }
}
