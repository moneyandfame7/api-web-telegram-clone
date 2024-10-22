import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'

import { Chat } from '@prisma/client'

import { JwtAuthGuard } from '../authorization/authorization.guard'
import { CurrentAuth } from '../authorization/authorization.decorator'
import { AuthorizationPayload } from '../authorization/authorization.types'

import { ChatDTO, CreateChatDto } from './chats.dto'
import { ChatsService } from './chats.service'
import { RawChat } from './chats.types'

@Controller('/chats')
export class ChatsController {
  public constructor(private service: ChatsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  public async createOne(@CurrentAuth() auth: AuthorizationPayload, @Body() dto: CreateChatDto): Promise<ChatDTO> {
    return this.service.createOne(auth.userId, dto)
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
  public async findOne(@CurrentAuth() auth: AuthorizationPayload, @Param('id', new ParseUUIDPipe()) id: string): Promise<ChatDTO | null> {
    return this.service.findOne(id, auth.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/raw/:id')
  public async findOneRaw(@CurrentAuth() auth: AuthorizationPayload, @Param('id', new ParseUUIDPipe()) id: string): Promise<RawChat | null> {
    return this.service.findOneRaw(id, auth.userId)
  }
}
