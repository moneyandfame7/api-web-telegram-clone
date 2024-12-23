import { Message } from '@prisma/client'

export interface RawMessage extends Message {}

export enum GetMessagesDirection {
  OLDER = 'OLDER',
  NEWER = 'NEWER',
  AROUND = 'AROUND'
}

export interface ReadMyHistoryResult {
  chatId: string
  maxId: number
  unreadCount: number
}
export type ReadTheirHistoryResult = Omit<ReadMyHistoryResult, 'unreadCount'>
