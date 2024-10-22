import { Injectable } from '@nestjs/common'
import { ChatDTO, CreateChatDto } from './chats.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { getRandomElement } from 'src/common/helpers'
import { CHAT_COLORS, chatInclude } from './chat.constants'
import { Chat } from '@prisma/client'
import { ChatDTOMapper } from './chat.mapper'
import { RawChat } from './chats.types'

@Injectable()
export class ChatsService {
  public constructor(private prisma: PrismaService) {}

  public async createOne(requesterId: string, dto: CreateChatDto): Promise<ChatDTO> {
    const memberIds = [...(dto.users ? new Set([...dto.users, requesterId]) : requesterId)]

    const raw = await this.prisma.chat.create({
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

    return ChatDTOMapper.toDTO(raw, requesterId)
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
    // спробувати include для чату, шоб отримувати не всіх мемберів, а тільки одного ( оптимізація тіпа я хз як це придумати)
    const raw: RawChat | null = await this.prisma.chat.findUnique({
      where: {
        id
      },
      include: {
        ...chatInclude,
        _count: {
          select: {
            members: true
          }
        }
      }
    })

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
}
