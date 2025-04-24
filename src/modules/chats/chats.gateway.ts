import { ConnectedSocket, MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Gateway } from '../../gateway/gateway'
import { TypedServer, TypedSocket, TypedSubscribeMessage } from './../../gateway/gateway.types'

import { RawChat } from './chats.types'
import { ChatDTOMapper } from './chat.mapper'
import { ChatDTO, CreateChatDto, UpdateAdminDTO, UpdateChatInfoDTO, UpdateChatPrivacyDTO } from './chats.dto'
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

  @TypedSubscribeMessage('chat:create')
  async createChat(@MessageBody() dto: CreateChatDto, @ConnectedSocket() client: TypedSocket): Promise<ChatDTO> {
    const raw = await this.chatService.createOneRaw(dto, client.userId)
    // await client.join(`chat-${raw.id}`)

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
        const socket = this.server.sockets.sockets.get(info.socketId)

        if (socket) {
          socket.join(`chat-${chatDto.id}`)

          if (info.socketId !== requesterSocketId) {
            socket.emit('chat:created', chatDto)
          }
        }

        // this.server.in(info.socketId).socketsJoin(`chat-${chatDto.id}`)
        // this.server.to(info.socketId).emit('chat:created', chatDto)
      })
    })
  }

  @TypedSubscribeMessage('chat:update-info')
  /**
   * @todo add Guard - Owner and Admin
   */
  async updateChatInfo(@MessageBody() dto: UpdateChatInfoDTO, @ConnectedSocket() client: TypedSocket) {
    const updatedInfo = await this.chatService.updateInfo(dto, client.userId)

    client.to(`chat-${updatedInfo.chatId}`).emit('chat:updated', updatedInfo)

    return updatedInfo
  }

  @TypedSubscribeMessage('chat:update-privacy')
  /**
   * @todo add Guard - only Owner
   */
  async updateChatPrivacy(@MessageBody() dto: UpdateChatPrivacyDTO, @ConnectedSocket() client: TypedSocket) {
    const updatedPrivacy = await this.chatService.updatePrivacy(dto, client.userId)

    client.to(`chat-${updatedPrivacy.chatId}`).emit('chat:updated', updatedPrivacy)

    return updatedPrivacy
  }

  @TypedSubscribeMessage('chat:update-admin')
  async updateAdmin(@MessageBody() dto: UpdateAdminDTO, @ConnectedSocket() client: TypedSocket): Promise<boolean> {
    await this.chatService.updateAdmin(dto, client.userId)

    await this.adminUpdated(
      {
        userId: dto.userId,
        chatId: dto.chatId,
        adminPermissions: dto.adminPermissions
      },
      client.id
    )

    return true
  }

  async adminUpdated(update: UpdateAdminDTO, requesterSocketId: string) {
    const sockets = await this.server.in(`chat-${update.chatId}`).fetchSockets()

    sockets.forEach(socket => {
      if (socket.id === requesterSocketId) {
        return
      }

      socket.emit('chat:admin-updated', update)
    })
  }
}
