import { Chat, ChatMember } from '@prisma/client'
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
}
