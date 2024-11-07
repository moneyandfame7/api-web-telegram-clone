import { Injectable } from '@nestjs/common'
import { SendMessageDTO } from './message.dto'
import { RawChat } from '../chats/chats.types'
import { RawMessage } from './message.types'
import { PrismaService } from '../../prisma/prisma.service'
import { chatInclude } from '../chats/chat.constants'

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}
  async sendMessage(dto: SendMessageDTO, requesterId: string): Promise<{ chat: RawChat; message: RawMessage }> {
    const chatToUpdate = await this.prisma.chat.findUniqueOrThrow({
      where: {
        id: dto.chatId
      },
      include: {
        ...chatInclude
      }
    })
    const updatedChat = await this.prisma.chat.update({
      where: {
        id: chatToUpdate.id
      },
      data: {
        lastMessage: {
          create: {
            text: dto.text,
            orderedId: chatToUpdate.lastMessage?.orderedId ?? 1,
            chatId: dto.chatId,
            senderId: requesterId
          }
        }
      },
      include: chatInclude
    })

    return { message: updatedChat.lastMessage!, chat: updatedChat }
  }

  findAll() {
    return `This action returns all message`
  }

  findOne(id: number) {
    return `This action returns a #${id} message`
  }

  remove(id: number) {
    return `This action removes a #${id} message`
  }
}
