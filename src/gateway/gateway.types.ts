import { Socket } from 'socket.io'

export interface ListenEvents {}

export interface EmitEvents {}

export interface SocketInfo {
  socketId: string
  sessionId: string
}

export interface CurrentSocket extends Socket<ListenEvents, EmitEvents> {
  userId: string
  sessionId: string
}
