import { Message } from '@prisma/client'

export interface RawMessage extends Message {}

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
