import { Message } from '@prisma/client'
import { ChatDTO } from '../chats/chats.dto'
import { RawUser } from '../users/users.types'

export interface RawMessage extends Message {
  sender: RawUser
  replyToMessage: {
    id: string
    sequenceId: number
    text: string | null
    sender: RawUser
  } | null
}

export interface ReplyMessageInfo {
  id: string
  sequenceId: string
  chatId: string
  text: string
  senderId: string
}
export enum GetMessagesDirection {
  OLDER = 'OLDER',
  NEWER = 'NEWER',
  AROUND = 'AROUND'
}

export interface ReadByMeHistoryResult {
  chatId: string
  maxId: number
  unreadCount: number
}
export type ReadByThemHistoryResult = Omit<ReadByMeHistoryResult, 'unreadCount'>

export interface EditMessageResult {
  id: string
  chatId: string
  text: string
  editedAt: Date
}

export interface DeleteMessagesResult {
  requesterId: string
  chat: ChatDTO
  ids: string[]
  deleteForAll: boolean
}
