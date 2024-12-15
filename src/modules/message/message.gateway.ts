import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { UseFilters, UsePipes } from '@nestjs/common'

import { GatewayValidationPipe, WsExceptionFilter } from '../../gateway/gateway-vadliation.pipe'
import { MessageService } from './message.service'
import { MessageDTO, ReadHistoryDTO, SendMessageDTO } from './message.dto'
import { TypedSocket, TypedServer } from '../../gateway/gateway.types'
import { Gateway } from '../../gateway/gateway'
import { RawMessage, ReadMyHistoryResult } from './message.types'
import { RawChat } from '../chats/chats.types'
import { MessageDTOMapper } from './message.mapper'
import { ChatDTOMapper } from '../chats/chat.mapper'
import { ChatDTO } from '../chats/chats.dto'
import { ChatGateway } from '../chats/chats.gateway'

@UsePipes(GatewayValidationPipe)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ cors: true })
export class MessageGateway {
  @WebSocketServer() server: TypedServer

  constructor(
    private readonly gateway: Gateway,
    private readonly chatsGateway: ChatGateway,
    private readonly messageService: MessageService
  ) {}

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() dto: SendMessageDTO,
    @ConnectedSocket() client: TypedSocket
  ): Promise<{ message: MessageDTO; chat: ChatDTO }> {
    const { message, chat } = await this.messageService.sendMessage(dto, client.userId)
    this.onNewMessage(message, chat, client.id)

    const chatDto = ChatDTOMapper.toDTO(chat, client.userId)
    const messageDto = MessageDTOMapper.toDTO(message, chatDto, client.userId)

    return { message: messageDto, chat: chatDto }
  }

  async onNewMessage(message: RawMessage, chat: RawChat, requesterSocketId: string) {
    const sockets = await this.server.in(`chat-${chat.id}`).fetchSockets()
    console.log(sockets.length)

    if (sockets.length === 0) {
      console.log('ЕМІЧУ САМ ЕВЕНТИ')
      chat.members.forEach(member => {
        const clients = this.gateway.clientsManager.getClients(member.userId)

        if (!clients || clients.length === 0) {
          return
        }
        const chatDto = ChatDTOMapper.toDTO(chat, member.userId)
        const messageDto = MessageDTOMapper.toDTO(message, chatDto, member.userId)
        // Clients - Це всі поточні підʼєднання користувачів
        clients.forEach(info => {
          // не емітимо евент для сокету, який створив чат
          if (info.socketId === requesterSocketId) {
            return
          }

          // this.server.to(info.socketId).emit('chat:created', chatDto)
          this.server.to(info.socketId).emit('onNewMessage', messageDto, chatDto)
        })
      })
      return
    }
    sockets.forEach(socket => {
      if (socket.id === requesterSocketId) {
        return
      }

      const chatDto = ChatDTOMapper.toDTO(chat, socket.data.userId)
      const messageDto = MessageDTOMapper.toDTO(message, chatDto, socket.data.userId)

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

  @SubscribeMessage('readHistory')
  async readHistory(
    @MessageBody() dto: ReadHistoryDTO,
    @ConnectedSocket() client: TypedSocket
  ): Promise<ReadMyHistoryResult> {
    const result = await this.messageService.readHistory(dto, client.userId)

    this.onReadMyHistory(result, client.userId, client.id)
    this.onReadTheirHistory(result, client.userId, client.id)

    return result
  }

  async onReadMyHistory(data: ReadMyHistoryResult, requesterId: string, requesterSocketId: string) {
    const sockets = this.gateway.clientsManager.getClients(requesterId)
    console.log(sockets?.length, 'ON READ MY HISTORY')

    sockets?.forEach(socket => {
      if (socket.socketId === requesterSocketId) {
        return
      }
      this.server.to(socket.socketId).emit('message:read-my', data)
    })
  }

  async onReadTheirHistory(data: ReadMyHistoryResult, requesterId: string, requesterSocketId: string) {
    const sockets = await this.server.in(`chat-${data.chatId}`).fetchSockets()
    console.log(sockets.length, 'ON READ THEIR HISTORY')
    sockets.forEach(socket => {
      if (socket.data.userId === requesterId) {
        return
      }
      socket.emit('message:read-their', { chatId: data.chatId, maxId: data.maxId })
    })
  }
}
