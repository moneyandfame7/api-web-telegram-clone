import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../authorization/authorization.guard'
import { CurrentAuth } from '../authorization/authorization.decorator'
import { AuthorizationPayload } from '../authorization/authorization.types'

import { ChatDetailsDTO, ChatDTO } from './chats.dto'
import { ChatsService } from './chats.service'
import { GetChatsResult, RawChat } from './chats.types'
import { ChatIdPipe } from './chat.pipes'

@Controller('/chats')
export class ChatsController {
  public constructor(private service: ChatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async findMany(@CurrentAuth() auth: AuthorizationPayload): Promise<GetChatsResult> {
    return this.service.findMany(auth.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/raw')
  public async findManyRaw(@CurrentAuth() auth: AuthorizationPayload): Promise<RawChat[]> {
    return this.service.findManyRaw(auth.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/details')
  public async getChatDetails(
    @CurrentAuth() auth: AuthorizationPayload,
    @Param('id', new ChatIdPipe()) id: string
  ): Promise<ChatDetailsDTO> {
    return this.service.getChatDetails(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  public async findOne(
    @CurrentAuth() auth: AuthorizationPayload,
    @Param('id', new ChatIdPipe()) id: string
  ): Promise<ChatDTO | null> {
    return this.service.findOne(id, auth.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/raw/:id')
  public async findOneRaw(
    @CurrentAuth() auth: AuthorizationPayload,
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<RawChat | null> {
    return this.service.findOneRaw(id, auth.userId)
  }
}
