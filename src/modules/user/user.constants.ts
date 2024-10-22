import { Prisma } from '@prisma/client'

export const userIncludes = {
  contacts: true,
  addedByContacts: true
} satisfies Prisma.UserInclude
