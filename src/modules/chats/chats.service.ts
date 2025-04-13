import { Injectable } from '@nestjs/common'
import { ChatDetailsDTO, ChatDTO, ChatMemberDTO, CreateChatDto, UpdateAdminDTO } from './chats.dto'
import { CHAT_COLORS, chatInclude } from './chat.constants'
import { Chat } from '@prisma/client'
import { ChatDTOMapper } from './chat.mapper'
import { GetChatsResult, RawChat } from './chats.types'
import { PrismaService } from '../../prisma/prisma.service'
import { getRandomElement, uniqueBy } from '../../common/helpers'
import { isUserId } from './chat.helpers'
import { UserDTOMapper } from '../users/users.mapper'
import { ChatIdInvalidError } from '../../common/errors/chats.errors'

@Injectable()
export class ChatsService {
  public constructor(private prisma: PrismaService) {}

  public async createOneRaw(dto: CreateChatDto, requesterId: string): Promise<RawChat> {
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
        ...(dto.type !== 'PRIVATE' && {
          chatPermissions: {
            create: {
              addUsers: true,
              changeInfo: true,
              pinMessages: true,
              sendMessages: true
            }
          }
        }),
        isSavedMessages: false
      },
      include: chatInclude
    })
  }

  public async findMany(requesterId: string): Promise<GetChatsResult> {
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

    const mentionedUsers = uniqueBy(
      raws.map(chat => chat.lastMessage?.sender).filter(sender => sender !== undefined),
      'id'
    )

    const chats = ChatDTOMapper.toDTOList(raws, requesterId)
    const users = UserDTOMapper.toDTOList(mentionedUsers, requesterId)

    return { chats, users }
  }

  public async findManyIds(requesterId: string): Promise<string[]> {
    const raws = await this.prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: requesterId
          }
        }
      },
      select: {
        id: true
      }
    })

    return raws.map(raw => raw.id)
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
    // const lastMessageForRequester = await this.prisma.message.findFirst({
    //   where: {
    //     chatId: id,
    //     deletedByUsers: {
    //       none: {
    //         id: requesterId
    //       }
    //     }
    //   },
    //   orderBy: {
    //     sequenceId: 'desc'
    //   }
    // })
    return this.prisma.chat.findUnique({
      where: {
        id
      },
      include: chatInclude
    })

    // return (
    //   chat && {
    //     ...chat,
    //     lastMessage: lastMessageForRequester
    //   }
    // )
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

      return chat || (await this.createOneRaw({ title: 'PRIVATE_CHAT', type: 'PRIVATE', users: [userId] }, requesterId))
    }

    return this.findOneRaw(chatId, requesterId)
  }

  public async updateAdmin(dto: UpdateAdminDTO, requesterId: string): Promise<boolean> {
    const chat = await this.findOneRaw(dto.chatId, requesterId)

    if (!chat) {
      throw new ChatIdInvalidError()
    }

    await this.prisma.chatMember.update({
      where: {
        compositeMemberId: {
          userId: dto.userId,
          chatId: dto.chatId
        }
      },
      data: {
        adminPermissions: {
          ...(dto.adminPermissions
            ? {
                upsert: {
                  create: {
                    ...dto.adminPermissions,
                    promotedByUserId: requesterId
                  },
                  update: {
                    ...dto.adminPermissions,
                    promotedByUserId: requesterId
                  }
                }
              }
            : { delete: true })
        }
      }
    })

    return true
  }

  public async getChatDetails(id: string): Promise<ChatDetailsDTO> {
    const members = await this.prisma.chatMember.findMany({
      where: {
        chatId: id
      },
      select: {
        adminPermissions: true,
        userId: true,
        chatId: true
      }
    })

    const filteredMembers: ChatMemberDTO[] = members.map(member => ({
      userId: member.userId,
      chatId: member.chatId,
      adminPermissions: member.adminPermissions ?? undefined
    }))

    const adminIds = filteredMembers.filter(member => !!member.adminPermissions).map(m => m.userId)

    return {
      chatId: id,
      adminIds,
      members: filteredMembers,
      kickedIds: []
    }
  }
}
