import { WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { UseFilters, UsePipes } from '@nestjs/common'

import { GatewayValidationPipe, WsExceptionFilter } from '../../gateway/gateway-vadliation.pipe'
import { MessagesService } from './messages.service'
import {
  DeleteMessagesDTO,
  EditMessageDTO,
  ForwardMessagesDTO,
  MessageDTO,
  ReadHistoryDTO,
  SendMessageDTO
} from './messages.dto'
import { TypedSocket, TypedServer, TypedSubscribeMessage } from '../../gateway/gateway.types'
import { Gateway } from '../../gateway/gateway'
import {
  DeleteMessagesResult,
  EditMessageResult,
  ForwardMessagesResult,
  RawMessage,
  ReadByMeHistoryResult
} from './messages.types'
import { RawChat } from '../chats/chats.types'
import { MessageDTOMapper } from './messages.mapper'
import { ChatDTOMapper } from '../chats/chat.mapper'
import { ChatDTO } from '../chats/chats.dto'

@UsePipes(GatewayValidationPipe)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ cors: true })
export class MessagesGateway {
  @WebSocketServer() server: TypedServer

  constructor(
    private readonly gateway: Gateway,
    private readonly messageService: MessagesService
  ) {}

  @TypedSubscribeMessage('message:send')
  async sendMessage(
    @MessageBody() dto: SendMessageDTO,
    @ConnectedSocket() client: TypedSocket
  ): Promise<{ message: MessageDTO; chat: ChatDTO }> {
    const { message, chat } = await this.messageService.sendMessage(dto, client.userId)
    this.onNewMessage(message, chat, client.id)

    const chatDto = ChatDTOMapper.toDTO(chat, client.userId)
    const messageDto = MessageDTOMapper.toDTO(message, client.userId)

    return { message: messageDto, chat: chatDto }
  }

  async onNewMessage(message: RawMessage, chat: RawChat, requesterSocketId: string) {
    const sockets = await this.server.in(`chat-${chat.id}`).fetchSockets()

    if (sockets.length === 0) {
      console.log('SOCKETS LENGTH === 0', 'WARUM????')
      chat.members.forEach(member => {
        const clients = this.gateway.clientsManager.getClients(member.userId)

        if (!clients || clients.length === 0) {
          return
        }
        const chatDto = ChatDTOMapper.toDTO(chat, member.userId)
        const messageDto = MessageDTOMapper.toDTO(message, member.userId)
        // Clients - Це всі поточні підʼєднання користувачів
        clients.forEach(info => {
          // не емітимо евент для сокету, який створив чат
          if (info.socketId === requesterSocketId) {
            return
          }

          this.server.to(info.socketId).emit('message:new', messageDto, chatDto)
        })
      })
      return
    }
    sockets.forEach(socket => {
      if (socket.id === requesterSocketId) {
        return
      }

      const chatDto = ChatDTOMapper.toDTO(chat, socket.data.userId)
      const messageDto = MessageDTOMapper.toDTO(message, socket.data.userId)

      socket.emit('message:new', messageDto, chatDto)
    })
  }

  @TypedSubscribeMessage('message:edit')
  async editMessage(@MessageBody() dto: EditMessageDTO, @ConnectedSocket() client: TypedSocket) {
    const result = await this.messageService.editMessage(dto, client.userId)
    this.onEditMessage(result, client.id)

    return result
  }
  async onEditMessage(result: EditMessageResult, requesterSocketId: string) {
    const sockets = await this.server.in(`chat-${result.chatId}`).fetchSockets()

    sockets.forEach(socket => {
      if (socket.id === requesterSocketId) {
        return
      }

      socket.emit('message:edited', result)
    })
  }

  @TypedSubscribeMessage('message:read-history')
  async readHistory(
    @MessageBody() dto: ReadHistoryDTO,
    @ConnectedSocket() client: TypedSocket
  ): Promise<ReadByMeHistoryResult> {
    console.log(client.userId, 'LOHHHH')
    const result = await this.messageService.readHistory(dto, client.userId)

    this.onReadHistoryByMe(result, client.userId, client.id)
    this.onReadHistoryByThem(result, client.userId)

    return result
  }

  /**
   * емітемо сокети з яких я підключений, окрім того, на якому я читав повідомлення
   */
  async onReadHistoryByMe(data: ReadByMeHistoryResult, requesterId: string, requesterSocketId: string) {
    const sockets = this.gateway.clientsManager.getClients(requesterId)

    sockets?.forEach(socket => {
      if (socket.socketId === requesterSocketId) {
        return
      }
      this.server.to(socket.socketId).emit('message:read-by-me', data)
    })
  }

  async onReadHistoryByThem(data: ReadByMeHistoryResult, requesterId: string) {
    const sockets = await this.server.in(`chat-${data.chatId}`).fetchSockets()

    sockets.forEach(socket => {
      if (socket.data.userId === requesterId) {
        return
      }
      socket.emit('message:read-by-them', { chatId: data.chatId, maxId: data.maxId })
    })
  }

  @TypedSubscribeMessage('message:delete')
  async deleteMessage(
    @MessageBody() dto: DeleteMessagesDTO,
    @ConnectedSocket() client: TypedSocket
  ): Promise<DeleteMessagesResult> {
    const result = await this.messageService.deleteMessages(dto, client.userId)
    this.onDeleteMessages(result, client.userId, client.id)
    const chat = ChatDTOMapper.toDTO(result.chat, client.userId)
    return { chat, deleteForAll: result.deleteForAll, ids: result.ids, requesterId: client.userId }
  }
  async onDeleteMessages(
    result: { chat: RawChat; ids: string[]; deleteForAll: boolean },
    requesterId: string,
    requesterSocketId: string
  ) {
    // const sockets = await this.server.in(`chat-${chat.id}`).fetchSockets()
    const sockets = await this.server.in(`chat-${result.chat.id}`).fetchSockets()

    // this.server.in
    // пофіксити, тут не фетчаться клієнти які підключені до кімнати
    console.log('TRIGGER DELETED!!!', { result }, sockets)

    const test = await this.server.fetchSockets()

    console.log({ test })
    if (result.deleteForAll) {
      sockets.forEach(socket => {
        if (socket.id === requesterSocketId) {
          return
        }
        console.log('TRIGGER TRIGGER DELETED')
        const chat = ChatDTOMapper.toDTO(result.chat, socket.data.userId)
        socket.emit('message:deleted', { ids: result.ids, chat, deleteForAll: result.deleteForAll, requesterId })
      })
    } else {
      const requesterClients = this.gateway.clientsManager.getClients(requesterId)
      const chat = ChatDTOMapper.toDTO(result.chat, requesterId)

      requesterClients?.forEach(socket => {
        if (socket.socketId === requesterSocketId) {
          return
        }
        this.server
          .to(socket.socketId)
          .emit('message:deleted', { ids: result.ids, chat, deleteForAll: result.deleteForAll, requesterId })
      })
    }
  }

  @TypedSubscribeMessage('message:forward')
  async forwardMessages(
    @MessageBody() dto: ForwardMessagesDTO,
    @ConnectedSocket() client: TypedSocket
  ): Promise<ForwardMessagesResult> {
    const result = await this.messageService.forwardMessages(dto, client.userId)
    this.onForwardMessages(result.messages, result.chat, client.id)
    const chat = ChatDTOMapper.toDTO(result.chat, client.userId)
    const messages = MessageDTOMapper.toDTOList(result.messages, client.userId)
    return { chat, messages }
  }

  async onForwardMessages(messages: RawMessage[], chat: RawChat, requesterSocketId: string) {
    const sockets = await this.server.in(`chat-${chat.id}`).fetchSockets()

    // Це для випадку, коли повідомлення відправляється користувачу, з яким ще не має чату в БД.
    if (sockets.length === 0) {
      console.log('SOCKETS LENGTH === 0')
      chat.members.forEach(member => {
        const clients = this.gateway.clientsManager.getClients(member.userId)

        if (!clients || clients.length === 0) {
          return
        }
        const chatDto = ChatDTOMapper.toDTO(chat, member.userId)
        const messageDTOList = MessageDTOMapper.toDTOList(messages, member.userId)

        // Clients - Це всі поточні підʼєднання користувачів
        clients.forEach(info => {
          // не емітимо евент для сокету, який створив чат
          if (info.socketId === requesterSocketId) {
            return
          }

          this.server.to(info.socketId).emit('message:forwarded', messageDTOList, chatDto)
        })
      })
      return
    }
    sockets.forEach(socket => {
      if (socket.id === requesterSocketId) {
        return
      }

      const chatDto = ChatDTOMapper.toDTO(chat, socket.data.userId)
      const messageDTOList = MessageDTOMapper.toDTOList(messages, socket.data.userId)

      socket.emit('message:forwarded', messageDTOList, chatDto)
    })
  }
}
