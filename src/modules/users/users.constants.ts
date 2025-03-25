import { Prisma } from '@prisma/client'

export const userInclude = {
  contacts: true,
  addedByContacts: true
} satisfies Prisma.UserInclude
