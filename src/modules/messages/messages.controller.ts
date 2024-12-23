import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../authorization/authorization.guard'
import { CurrentAuth } from '../authorization/authorization.decorator'
import { AuthorizationPayload } from '../authorization/authorization.types'

import { MessagesService } from './messages.service'
import { GetMessagesDTO, MessageDTO } from './messages.dto'

@Controller('/messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getMessages(
    @CurrentAuth() auth: AuthorizationPayload,
    @Query() dto: GetMessagesDTO
  ): Promise<MessageDTO[]> {
    return this.service.getMessages(dto, auth.userId)
  }
}
