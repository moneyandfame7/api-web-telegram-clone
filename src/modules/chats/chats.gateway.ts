import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Gateway } from '../../gateway/gateway'
import { TypedServer, TypedSocket } from './../../gateway/gateway.types'

import { RawChat } from './chats.types'
import { ChatDTOMapper } from './chat.mapper'
import { ChatDTO, CreateChatDto } from './chats.dto'
import { ChatsService } from './chats.service'
import { UseFilters, UsePipes } from '@nestjs/common'
import { GatewayValidationPipe, WsExceptionFilter } from '../../gateway/gateway-vadliation.pipe'

@UsePipes(GatewayValidationPipe)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: TypedServer

  public constructor(
    private gateway: Gateway,
    private chatService: ChatsService
  ) {}

  @SubscribeMessage('createChat')
  async createChat(@MessageBody() dto: CreateChatDto, @ConnectedSocket() client: TypedSocket): Promise<ChatDTO> {
    const raw = await this.chatService.createOne(dto, client.userId)

    this.chatCreated(raw, client.id)

    return ChatDTOMapper.toDTO(raw, client.userId)
  }

  chatCreated(chat: RawChat, requesterSocketId: string) {
    chat.members.forEach(member => {
      const clients = this.gateway.clientsManager.getClients(member.userId)

      if (!clients || clients.length === 0) {
        return
      }
      const chatDto = ChatDTOMapper.toDTO(chat, member.userId)
      // Clients - Це всі поточні підʼєднання користувачів
      clients.forEach(info => {
        // не емітимо евент для сокету, який створив чат
        if (info.socketId === requesterSocketId) {
          return
        }

        this.server.to(info.socketId).emit('chat:created', chatDto)
      })
    })
  }
}
