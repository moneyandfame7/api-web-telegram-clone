import { SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { ChatDTO, UpdateAdminDTO } from '../modules/chats/chats.dto'
import { MessageDTO } from '../modules/messages/messages.dto'
import {
  DeleteMessagesResult,
  EditMessageResult,
  ReadByMeHistoryResult,
  ReadByThemHistoryResult
} from '../modules/messages/messages.types'

export interface ListenEvents {
  ['room:join']: void

  ['chat:create']: void
  ['chat:update-admin']: void

  ['message:send']: void
  ['message:edit']: void
  ['message:delete']: void
  ['message:read-history']: void
  ['message:forward']: void
}

export interface EmitEvents {
  ['chat:created']: (chat: ChatDTO) => void
  ['chat:admin-updated']: (data: UpdateAdminDTO) => void

  ['message:new']: (message: MessageDTO, chat: ChatDTO) => void
  ['message:edited']: (data: EditMessageResult) => void
  ['message:deleted']: (data: DeleteMessagesResult) => void
  ['message:read-by-me']: (data: ReadByMeHistoryResult) => void
  ['message:read-by-them']: (data: ReadByThemHistoryResult) => void
  ['message:forwarded']: (messages: MessageDTO[], chat: ChatDTO) => void
}

export interface SocketInfo {
  socketId: string
  sessionId: string
}

export interface TypedSocketData {
  userId: string
  sessionId: string
}

export type TypedServer = Server<ListenEvents, EmitEvents, any, TypedSocketData>

export const TypedSubscribeMessage = (message: keyof ListenEvents) => {
  return SubscribeMessage(message)
}

export interface TypedSocket extends Socket<ListenEvents, EmitEvents> {
  userId: string
  sessionId: string
  data: {
    userId: string
    sessionId: string
  }
}
