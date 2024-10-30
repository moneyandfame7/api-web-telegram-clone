import { Injectable } from '@nestjs/common'
import { CreateChatDto } from './chats.dto'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ChatsRepository {
  public constructor(private prisma: PrismaService) {}

  public async create(dto: CreateChatDto) {}
}
