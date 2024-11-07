import { Server, Socket } from 'socket.io'
import { ChatDTO } from '../modules/chats/chats.dto'
import { MessageDTO } from '../modules/message/message.dto'

export interface ListenEvents {}

export interface EmitEvents {
  ['chat:created']: (chat: ChatDTO) => void

  ['onNewMessage']: (message: MessageDTO, chat: ChatDTO) => void
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

export interface TypedSocket extends Socket<ListenEvents, EmitEvents> {
  userId: string
  sessionId: string
  data: {
    userId: string
    sessionId: string
  }
}
