import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

import { RawChat } from '../chats/chats.types'
import { chatInclude } from '../chats/chat.constants'

import { GetMessagesDirection, RawMessage, ReadMyHistoryResult } from './message.types'
import { GetMessagesDTO, MessageDTO, ReadHistoryDTO, SendMessageDTO } from './message.dto'
import { MessageDTOMapper } from './message.mapper'
import { InvalidEntityIdError } from '../../common/errors/common.errors'
import { ChatsService } from '../chats/chats.service'

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService
  ) {}
  /**
   * тут в dto chatId може бути або UUID або `u_UUID`.
   * `u_UUID`: використовується для приватного чату, якого ще не існує.
   */
  async sendMessage(dto: SendMessageDTO, requesterId: string): Promise<{ chat: RawChat; message: RawMessage }> {
    const chat = await this.chatsService.findOrCreate(dto.chatId, requesterId)
    if (!chat) {
      throw new InvalidEntityIdError()
    }
    const message = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        text: dto.text,
        sequenceId: chat.lastMessage?.sequenceId !== undefined ? chat.lastMessage.sequenceId + 1 : 0,
        senderId: requesterId
      }
    })

    const updatedChat = await this.prisma.chat.update({
      where: { id: chat.id },
      data: {
        ...(!chat.firstMessage && {
          firstMessage: { connect: { id: message.id } }
        }),
        lastMessage: { connect: { id: message.id } },
        members: {
          updateMany: {
            where: {
              userId: {
                not: requesterId
              }
            },
            data: {
              unreadCount: {
                increment: 1
              }
            }
          }
        }
      },
      include: chatInclude
    })

    return { message: updatedChat.lastMessage!, chat: updatedChat }
  }

  public async getMessages(dto: GetMessagesDTO, requesterId: string): Promise<MessageDTO[]> {
    const chat = await this.chatsService.findOneRaw(dto.chatId, requesterId)

    if (!chat) {
      throw new InvalidEntityIdError()
    }
    if (dto.direction === GetMessagesDirection.AROUND) {
      if (dto.sequenceId === undefined) {
        throw new BadRequestException('Sequence id is not provided')
      }
      const halfLimit = Math.round(dto.limit / 2)
      const older = await this.prisma.message.findMany({
        where: { chatId: chat.id },
        orderBy: { sequenceId: 'asc' },
        take: -halfLimit,
        skip: 0,
        // ...(dto.sequenceId && {
        cursor: {
          compositeSequenceId: { chatId: chat.id, sequenceId: dto.sequenceId }
        }
        // })
      })
      const newer = await this.prisma.message.findMany({
        where: { chatId: chat.id },
        orderBy: { sequenceId: 'asc' },
        take: halfLimit,
        skip: 1,
        ...(dto.sequenceId && {
          cursor: {
            compositeSequenceId: { chatId: chat.id, sequenceId: dto.sequenceId }
          }
        })
      })

      return MessageDTOMapper.toDTOList([...older, ...newer], requesterId)
    }

    if (dto.direction === GetMessagesDirection.OLDER && dto.sequenceId === 0) {
      return []
    }
    const raws = await this.prisma.message.findMany({
      where: {
        chatId: chat.id
      },
      orderBy: { sequenceId: 'asc' },
      take: dto.direction === GetMessagesDirection.OLDER ? -dto.limit : +dto.limit,
      skip: dto.skipCursor === false ? 0 : dto.sequenceId !== undefined ? 1 : 0,
      ...(dto.sequenceId && {
        cursor: {
          compositeSequenceId: { chatId: chat.id, sequenceId: dto.sequenceId }
        }
      })
    })

    return MessageDTOMapper.toDTOList(raws, requesterId)
  }

  public async readHistory(dto: ReadHistoryDTO, requesterId: string): Promise<ReadMyHistoryResult> {
    const chat = await this.chatsService.findOneRaw(dto.chatId, requesterId)

    if (!chat) {
      throw new InvalidEntityIdError()
    }

    const member = await this.prisma.chatMember.findFirst({
      where: {
        userId: requesterId,
        chatId: dto.chatId
      }
    })
    if (!member) {
      throw new InvalidEntityIdError()
    }

    const newUnreadCount = await this.prisma.message.count({
      where: { chatId: dto.chatId, senderId: { not: requesterId }, sequenceId: { gt: dto.maxId } }
    })

    await this.prisma.chatMember.update({
      where: {
        id: member.id
      },
      data: {
        myLastReadMessageSequenceId: dto.maxId,
        unreadCount: newUnreadCount
      }
    })

    return { maxId: dto.maxId, chatId: dto.chatId, unreadCount: newUnreadCount }
  }
}
