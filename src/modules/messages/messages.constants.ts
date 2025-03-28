import { Prisma } from '@prisma/client'
import { userInclude } from '../users/users.constants'

export const messagesIncludes = {
  sender: {
    include: userInclude
  },
  replyToMessage: {
    select: {
      id: true,
      sequenceId: true,
      text: true,
      sender: {
        include: userInclude
      }
    }
  }
} satisfies Prisma.MessageInclude
