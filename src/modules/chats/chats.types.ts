import { Chat, ChatMember, Message } from '@prisma/client'
import { RawUser } from '../user/user.types'

export interface RawChat extends Chat {
  members: Array<
    {
      user: RawUser
    } & ChatMember
  >
  _count: {
    members: number
  }
  lastMessage: Message | null
  firstMessage: Message | null
}
