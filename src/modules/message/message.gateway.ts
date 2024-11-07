import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { UseFilters, UsePipes } from '@nestjs/common'

import { GatewayValidationPipe, WsExceptionFilter } from '../../gateway/gateway-vadliation.pipe'
import { MessageService } from './message.service'
import { MessageDTO, SendMessageDTO } from './message.dto'
import { TypedSocket, TypedServer } from '../../gateway/gateway.types'
import { Gateway } from '../../gateway/gateway'
import { RawMessage } from './message.types'
import { RawChat } from '../chats/chats.types'
import { MessageDTOMapper } from './message.mapper'
import { ChatDTOMapper } from '../chats/chat.mapper'
import { ChatDTO } from '../chats/chats.dto'

@UsePipes(GatewayValidationPipe)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ cors: true })
export class MessageGateway {
  @WebSocketServer() server: TypedServer

  constructor(
    private readonly gateway: Gateway,
    private readonly messageService: MessageService
  ) {}

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() dto: SendMessageDTO,
    @ConnectedSocket() client: TypedSocket
  ): Promise<{ message: MessageDTO; chat: ChatDTO }> {
    const { message, chat } = await this.messageService.sendMessage(dto, client.userId)
    this.onNewMessage(message, chat, client.id)

    const messageDto = MessageDTOMapper.toDTO(message, client.userId)
    const chatDto = ChatDTOMapper.toDTO(chat, client.userId)

    return { message: messageDto, chat: chatDto }
  }

  async onNewMessage(message: RawMessage, chat: RawChat, requesterSocketId: string) {
    const sockets = await this.server.in(`chat-${chat.id}`).fetchSockets()
    sockets.forEach(socket => {
      if (socket.id === requesterSocketId) {
        return
      }

      console.log('[DATA]:', socket.data)

      const messageDto = MessageDTOMapper.toDTO(message, socket.data.userId)
      const chatDto = ChatDTOMapper.toDTO(chat, socket.data.userId)

      socket.emit('onNewMessage', messageDto, chatDto)
    })
    // sockets[0].
    // chat.members.forEach(member => {
    //   const clients = this.gateway.clientsManager.getClients(member.userId)

    //   if (!clients || clients.length === 0) {
    //     return
    //   }

    //   const messageDto = MessageDTOMapper.toDTO(message, member.userId)

    //   clients.forEach(info => {
    //     // не емітимо евент для сокету, який створив чат
    //     if (info.socketId === requesterSocketId) {
    //       return
    //     }

    //     this.server.to(`chat-${chat.id}`).emit('message:created', messageDto)
    //   })
    // })
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messageService.remove(id)
  }
}
