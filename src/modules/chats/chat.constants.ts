import type { ChatColor, Prisma } from '@prisma/client'
import { userInclude } from '../users/users.constants'
import { messagesIncludes } from '../messages/messages.constants'

export const chatInclude = {
  members: {
    include: {
      user: {
        include: userInclude
      },
      lastVisibleMessage: {
        include: messagesIncludes
      },
      adminPermissions: {
        select: {
          addNewAdmins: true,
          banUsers: true,
          changeInfo: true,
          deleteMessages: true,
          pinMessages: true,
          customTitle: true,
          promotedByUserId: true
        }
      }
    }
  },
  lastMessage: {
    include: messagesIncludes
  },
  firstMessage: {
    include: messagesIncludes
  },
  chatPermissions: true,
  _count: {
    select: {
      members: true
    }
  }
} satisfies Prisma.ChatInclude

export const CHAT_COLORS: ChatColor[] = ['BLUE', 'GREEN', 'ORANGE', 'PINK', 'PURPLE', 'YELLOW']
