import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../authorization/authorization.guard'
import { CurrentAuth } from '../authorization/authorization.decorator'
import { AuthorizationPayload } from '../authorization/authorization.types'

import { MessageService } from './message.service'
import { GetMessagesDTO, MessageDTO } from './message.dto'

@Controller('/messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getMessages(
    @CurrentAuth() auth: AuthorizationPayload,
    @Query() dto: GetMessagesDTO
  ): Promise<MessageDTO[]> {
    return this.messageService.getMessages(dto, auth.userId)
  }
}
