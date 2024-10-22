import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateChatDto } from './chats.dto'

@Injectable()
export class ChatsRepository {
  public constructor(private prisma: PrismaService) {}

  public async create(dto: CreateChatDto) {}
}
