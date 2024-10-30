import { CurrentSocket } from './../../gateway/gateway.types'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Gateway } from '../../gateway/gateway'

import { RawChat } from './chats.types'
import { ChatDTOMapper } from './chat.mapper'
import { ChatDTO, CreateChatDto } from './chats.dto'
import { ChatsService } from './chats.service'
import {
  BadRequestException,
  UseFilters,
  UsePipes,
  ValidationError as DTOValidationError,
  ValidationPipe
} from '@nestjs/common'
import { WsExceptionFilter } from '../../gateway/gateway-vadliation.pipe'
import { UnauthorizedError } from '../../common/errors/authorization.errors'
import { ValidationError } from '../../common/errors/error-code.enum'

@UsePipes(
  new ValidationPipe({
    stopAtFirstError: true,
    exceptionFactory(validationErrors: DTOValidationError[] = []) {
      // Here are the errors
      if (this.isDetailedOutputDisabled) {
        return new WsException('Bad Request')
      }
      const errors = this.flattenValidationErrors(validationErrors)

      return new ValidationError(errors)
    }
  })
)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server

  public constructor(
    private gateway: Gateway,
    private chatService: ChatsService
  ) {}

  /**
   * @todo перевірити ще цей ендпоінт, перевірити dto
   */
  @SubscribeMessage('createChat')
  async createChat(@MessageBody() dto: CreateChatDto, @ConnectedSocket() client: CurrentSocket): Promise<ChatDTO> {
    const raw = await this.chatService.createOne(client.userId, dto)

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