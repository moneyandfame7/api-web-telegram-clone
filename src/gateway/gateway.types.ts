import { Server, Socket } from 'socket.io'
import { ChatDTO } from '../modules/chats/chats.dto'
import { MessageDTO } from '../modules/messages/messages.dto'
import { ReadByMeHistoryResult, ReadByThemHistoryResult } from '../modules/messages/messages.types'
import { SubscribeMessage } from '@nestjs/websockets'

export interface ListenEvents {
  ['chat:create']: void

  ['message:send']: void
  ['message:read-history']: void
}

export interface EmitEvents {
  ['chat:created']: (chat: ChatDTO) => void

  ['message:new']: (message: MessageDTO, chat: ChatDTO) => void
  ['message:read-by-me']: (data: ReadByMeHistoryResult) => void
  ['message:read-by-them']: (data: ReadByThemHistoryResult) => void
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
