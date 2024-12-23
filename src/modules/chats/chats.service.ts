import { Injectable } from '@nestjs/common'
import { ChatDTO, CreateChatDto } from './chats.dto'
import { CHAT_COLORS, chatInclude } from './chat.constants'
import { Chat } from '@prisma/client'
import { ChatDTOMapper } from './chat.mapper'
import { RawChat } from './chats.types'
import { PrismaService } from '../../prisma/prisma.service'
import { getRandomElement } from '../../common/helpers'
import { isUserId } from './chat.helpers'

@Injectable()
export class ChatsService {
  public constructor(private prisma: PrismaService) {}

  public async createOne(dto: CreateChatDto, requesterId: string): Promise<RawChat> {
    const memberIds = [...(dto.users ? new Set([...dto.users, requesterId]) : requesterId)]

    return this.prisma.chat.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        color: getRandomElement(CHAT_COLORS),
        members: {
          create: memberIds.map(memberId => ({
            userId: memberId,
            isOwner: memberId === requesterId
          }))
        },
        isSavedMessages: false
      },
      include: chatInclude
    })
  }

  public async findMany(requesterId: string): Promise<ChatDTO[]> {
    const raws = await this.prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: requesterId
          }
        }
      },
      include: chatInclude
    })

    return ChatDTOMapper.toDTOList(raws, requesterId)
  }

  public async findManyRaw(requesterId: string): Promise<RawChat[]> {
    return this.prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: requesterId
          }
        }
      },
      include: chatInclude
    })
  }

  public async findOne(id: string, requesterId: string): Promise<ChatDTO | null> {
    let raw: RawChat | null
    if (isUserId(id)) {
      raw = await this.findOneRawByUser(id.split('u_')[1], requesterId)
    } else {
      raw = await this.findOneRaw(id, requesterId)
    }

    if (raw) {
      return ChatDTOMapper.toDTO(raw, requesterId)
    }

    return null
  }

  public async findOneRaw(id: string, requesterId: string): Promise<RawChat | null> {
    return this.prisma.chat.findUnique({
      where: {
        id
      },
      include: chatInclude
    })
  }

  private async findOneRawByUser(userId: string, requesterId: string) {
    return this.prisma.chat.findFirst({
      where: {
        type: 'PRIVATE',
        members: {
          some: {
            userId
          }
        },
        AND: {
          members: {
            some: { userId: requesterId }
          }
        }
      },
      include: chatInclude
    })
  }

  public async findOneByUser(userId: string, requesterId: string) {
    const raw = await this.findOneRawByUser(userId, requesterId)

    if (raw) {
      return ChatDTOMapper.toDTO(raw, requesterId)
    }
    return null
  }

  public async findOrCreate(chatId: string, requesterId: string) {
    if (isUserId(chatId)) {
      const userId = chatId.split('u_')[1]
      const chat = await this.findOneRawByUser(userId, requesterId)

      return chat || (await this.createOne({ title: 'PRIVATE_CHAT', type: 'PRIVATE', users: [userId] }, requesterId))
    }

    return this.findOneRaw(chatId, requesterId)
  }
}
