import { HttpStatus } from '@nestjs/common'
import { BaseError, ErrorCode } from './error-code.enum'

export class ChatIdInvalidError extends BaseError {
  public constructor(details?: any) {
    super(HttpStatus.BAD_REQUEST, ErrorCode.CHAT_ID_INVALID, 'The provided chat id is invalid.', details)
  }
}
