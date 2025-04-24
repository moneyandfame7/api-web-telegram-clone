import { Chat, ChatMember, ChatPermissions, ChatPrivacyType, Message } from '@prisma/client'
import { RawUser } from '../users/users.types'
import { ChatDTO, UpdateChatInfoDTO, UpdateChatPrivacyDTO } from './chats.dto'
import { UserDTO } from '../users/users.dto'
import { RawMessage } from '../messages/messages.types'

export interface GetChatsResult {
  chats: ChatDTO[]
  users: UserDTO[]
}

export interface UpdateChatPrivacyResult {
  chatId: string
  privacyType?: ChatPrivacyType
  allowContentSaving?: boolean
}

export type UpdateChatResult = UpdateChatInfoDTO & UpdateChatPrivacyDTO

export interface RawChat extends Chat {
  members: Array<RawChatMember>
  _count: {
    members: number
  }
  lastMessage: RawMessage | null
  firstMessage: RawMessage | null
  chatPermissions: ChatPermissions | null
}

export interface RawChatMember extends ChatMember {
  user: RawUser
  lastVisibleMessage: RawMessage | null
  adminPermissions: RawAdminPermissions | null
}

export interface RawAdminPermissions {
  addNewAdmins: boolean
  banUsers: boolean
  changeInfo: boolean
  deleteMessages: boolean
  pinMessages: boolean
  customTitle: string | null
  promotedByUserId: string
}
