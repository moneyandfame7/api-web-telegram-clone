import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

import { RawChat } from '../chats/chats.types'
import { chatInclude } from '../chats/chat.constants'

import { EditMessageResult, GetMessagesDirection, ReadByMeHistoryResult } from './messages.types'
import {
  DeleteMessagesDTO,
  EditMessageDTO,
  GetMessagesDTO,
  MessageDTO,
  ReadHistoryDTO,
  SendMessageDTO
} from './messages.dto'
import { MessageDTOMapper } from './messages.mapper'
import { InvalidEntityIdError } from '../../common/errors/common.errors'
import { ChatsService } from '../chats/chats.service'
import { ChatIdInvalidError } from '../../common/errors/chats.errors'
import { Prisma } from '@prisma/client'
import { messagesIncludes } from './messages.constants'

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService
  ) {}
  /**
   * тут в dto chatId може бути або UUID або `u_UUID`.
   * `u_UUID`: використовується для приватного чату, якого ще не існує.
   */
  async sendMessage(dto: SendMessageDTO, requesterId: string): Promise<{ chat: RawChat; message: any }> {
    const chat = await this.chatsService.findOrCreate(dto.chatId, requesterId)
    if (!chat) {
      throw new InvalidEntityIdError()
    }
    const message = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        text: dto.text,
        sequenceId: chat.lastMessage?.sequenceId !== undefined ? chat.lastMessage.sequenceId + 1 : 0,
        senderId: requesterId,
        replyToMessageId: dto.replyToMsgId
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

  async editMessage(dto: EditMessageDTO, requesterId: string): Promise<EditMessageResult> {
    const chat = await this.chatsService.findOneRaw(dto.chatId, requesterId)
    if (!chat) {
      throw new ChatIdInvalidError('messagesService.editMessage')
    }

    const result = await this.prisma.message.update({
      where: { id: dto.id, chatId: dto.chatId },
      data: { text: dto.text, editedAt: new Date() }
    })

    return { ...dto, editedAt: result.editedAt! }
  }

  public async getMessages(dto: GetMessagesDTO, requesterId: string): Promise<MessageDTO[]> {
    const chat = await this.chatsService.findOneRaw(dto.chatId, requesterId)

    if (!chat) {
      throw new InvalidEntityIdError()
    }

    const cursorMessage =
      dto.sequenceId !== undefined
        ? await this.prisma.message.findFirst({
            where: {
              sequenceId: {
                lte: dto.sequenceId
              },
              chatId: dto.chatId,
              deletedByUsers: {
                none: {
                  id: requesterId
                }
              }
            },
            orderBy: { sequenceId: 'desc' }
          })
        : null

    if (dto.sequenceId !== undefined && !cursorMessage) {
      throw new InvalidEntityIdError('cursorMessage')
    }

    console.log({ cursorMessage }, { dto })

    const where: Prisma.MessageWhereInput = {
      chatId: chat.id,
      deletedByUsers: {
        every: {
          id: {
            not: requesterId
          }
        }
      }
    }
    if (dto.direction === GetMessagesDirection.AROUND) {
      if (cursorMessage?.sequenceId === undefined) {
        throw new BadRequestException('CursorMessage is undefined')
      }
      const halfLimit = Math.round(dto.limit / 2)
      const older = await this.prisma.message.findMany({
        where,
        orderBy: { sequenceId: 'asc' },
        take: -halfLimit,
        skip: 0,
        cursor: {
          compositeSequenceId: { chatId: chat.id, sequenceId: cursorMessage.sequenceId }
        },
        include: messagesIncludes
      })
      const newer = await this.prisma.message.findMany({
        where,
        orderBy: { sequenceId: 'asc' },
        take: halfLimit,
        skip: 1,
        cursor: {
          compositeSequenceId: { chatId: chat.id, sequenceId: cursorMessage.sequenceId }
        },
        include: messagesIncludes
      })

      return MessageDTOMapper.toDTOList([...older, ...newer], requesterId)
    }

    if (dto.direction === GetMessagesDirection.OLDER && cursorMessage?.sequenceId === 0) {
      return []
    }

    const raws = await this.prisma.message.findMany({
      where,
      orderBy: { sequenceId: 'asc' },
      take: dto.direction === GetMessagesDirection.OLDER ? -dto.limit : +dto.limit,
      skip: dto.skipCursor === false ? 0 : cursorMessage?.sequenceId !== undefined ? 1 : 0,
      ...(cursorMessage?.sequenceId && {
        cursor: {
          compositeSequenceId: { chatId: chat.id, sequenceId: cursorMessage?.sequenceId }
        }
      }),
      include: messagesIncludes
    })

    return MessageDTOMapper.toDTOList(raws, requesterId)
  }

  public async deleteMessages(
    dto: DeleteMessagesDTO,
    requesterId: string
  ): Promise<{ chat: RawChat; ids: string[]; deleteForAll: boolean }> {
    const chat = await this.chatsService.findOneRaw(dto.chatId, requesterId)
    if (!chat) {
      throw new ChatIdInvalidError('messagesService.editMessage')
    }
    if (dto.deleteForAll) {
      await this.prisma.message.deleteMany({
        where: {
          chatId: dto.chatId,
          id: {
            in: dto.ids
          }
        }
      })
      if (chat.lastMessage && dto.ids.includes(chat.lastMessage.id)) {
        const newLastMessage = await this.prisma.message.findFirst({
          where: { chatId: chat.id },
          orderBy: {
            sequenceId: 'desc'
          }
        })
        if (newLastMessage) {
          const updatedChat = await this.prisma.chat.update({
            where: { id: chat.id },
            data: {
              lastMessage: {
                connect: { id: newLastMessage.id }
              }
            },
            include: chatInclude
          })

          return { chat: updatedChat, ids: dto.ids, deleteForAll: dto.deleteForAll }
        }
      }
    } else {
      await this.prisma.user.update({
        where: {
          id: requesterId
        },
        data: {
          deletedMessages: {
            connect: dto.ids.map(id => ({ id }))
          }
        }
      })

      const newLastMessage = await this.prisma.message.findFirst({
        where: {
          chatId: chat.id,
          deletedByUsers: {
            none: { id: requesterId }
          }
        },
        orderBy: {
          sequenceId: 'desc'
        }
      })

      // треба оновлювати lastReadMessageId але я не знаю як точно, треба дізнаватись поточний, і шукати повідомлення, де sequenceId меньше ніж те яке зараз, і відправником є не я. + треба оновлювати лише тоді, коли це потрібно, а не просто так?
      // можливо треба взагалі перенести з chatMember все в user, або навпаки все в chatMember?
      // + можливо прибрати з чату lastMessage і зробити його окремо для всіх користувачів
      // const newLastReadMessage = await this.prisma.message.findFirst({
      //   where:{
      //     sequenceId:{lt:}
      //   }
      // })

      const updatedChat = await this.prisma.chat.update({
        where: { id: dto.chatId },
        data: {
          members: {
            update: {
              where: { compositeMemberId: { chatId: dto.chatId, userId: requesterId } },
              data: {
                lastVisibleMessageId: newLastMessage?.id
                // myLastReadMessageSequenceId:
              }
            }
          }
        },
        include: chatInclude
      })

      return { chat: updatedChat, ids: dto.ids, deleteForAll: dto.deleteForAll }
    }

    return { chat: chat, ids: dto.ids, deleteForAll: dto.deleteForAll }
  }

  public async readHistory(dto: ReadHistoryDTO, requesterId: string): Promise<ReadByMeHistoryResult> {
    const chat = await this.chatsService.findOneRaw(dto.chatId, requesterId)

    if (!chat) {
      throw new InvalidEntityIdError('HAHAH')
    }

    const member = await this.prisma.chatMember.findUnique({
      where: {
        compositeMemberId: {
          userId: requesterId,
          chatId: dto.chatId
        }
      }
    })
    if (!member) {
      throw new InvalidEntityIdError('LALALAL')
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
    // треба ще оновлювати кількість прочитаних повідомлень, але то треба тестити вже. ще треба повертати весь чат, щоб оновлювати і lastMessage?
    return { maxId: dto.maxId, chatId: dto.chatId, unreadCount: newUnreadCount }
  }
}
