import type { ChatColor, Prisma } from '@prisma/client'
import { userIncludes } from '../user/user.constants'

export const chatInclude = {
  members: {
    include: {
      user: {
        include: userIncludes
      }
    }
  },
  lastMessage: true,
  firstMessage: true,
  _count: {
    select: {
      members: true
    }
  }
} satisfies Prisma.ChatInclude

export const CHAT_COLORS: ChatColor[] = ['BLUE', 'GREEN', 'ORANGE', 'PINK', 'PURPLE', 'YELLOW']
