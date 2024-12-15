import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { JwtAuthGuard } from '../authorization/authorization.guard'
import { CurrentAuth } from '../authorization/authorization.decorator'
import { AuthorizationPayload } from '../authorization/authorization.types'

import { ChatDTO, CreateChatDto } from './chats.dto'
import { ChatsService } from './chats.service'
import { RawChat } from './chats.types'
import { ChatGateway } from './chats.gateway'
import { ChatDTOMapper } from './chat.mapper'
import { ChatIdPipe } from './chat.pipes'

@Controller('/chats')
export class ChatsController {
  public constructor(
    private service: ChatsService,
    private chatGateway: ChatGateway
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  public async createOne(@CurrentAuth() auth: AuthorizationPayload, @Body() dto: CreateChatDto): Promise<ChatDTO> {
    const chat = await this.service.createOne(auth.userId, dto)

    // this.chatGateway.chatCreated(chat)

    return ChatDTOMapper.toDTO(chat, auth.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('test')
  public async test(@CurrentAuth() auth: AuthorizationPayload, @Body() body: CreateChatDto) {
    const users = [...body.users, auth.userId]

    const chat = {
      id: randomUUID(),
      ...body,
      users
    }

    return chat
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  public async findMany(@CurrentAuth() auth: AuthorizationPayload): Promise<ChatDTO[]> {
    return this.service.findMany(auth.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/raw')
  public async findManyRaw(@CurrentAuth() auth: AuthorizationPayload): Promise<RawChat[]> {
    return this.service.findManyRaw(auth.userId)
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

  @UseGuards(JwtAuthGuard)
  @Get('/by-user/:id')
  public async findOneByUser(
    @CurrentAuth() auth: AuthorizationPayload,
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<ChatDTO | null> {
    return this.service.findOneByUser(id, auth.userId)
  }
}
