import { Chat, ChatMember, Message } from '@prisma/client'
import { RawUser } from '../users/users.types'
import { ChatDTO } from './chats.dto'
import { UserDTO } from '../users/users.dto'
import { RawMessage } from '../messages/messages.types'

export interface GetChatsResult {
  chats: ChatDTO[]
  users: UserDTO[]
}

export interface RawChat extends Chat {
  members: Array<RawChatMember>
  _count: {
    members: number
  }
  lastMessage: RawMessage | null
  firstMessage: RawMessage | null
}

export interface RawChatMember extends ChatMember {
  user: RawUser
  lastVisibleMessage: RawMessage | null
}
