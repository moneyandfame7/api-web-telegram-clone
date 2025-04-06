import { Prisma } from '@prisma/client'
import { userInclude } from '../users/users.constants'

const replyToMessage = {
  select: {
    id: true,
    sequenceId: true,
    text: true,
    sender: {
      include: userInclude
    }
  }
} satisfies Prisma.MessageInclude['replyToMessage']

export const messagesIncludes = {
  sender: {
    include: userInclude
  },
  replyToMessage,
  forwardFromMessage: {
    select: {
      id: true,
      sequenceId: true,
      chatId: true,
      text: true,
      sender: {
        include: userInclude
      },
      replyToMessage
    }
  }
} satisfies Prisma.MessageInclude
