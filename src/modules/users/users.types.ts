import { Contact, User } from '@prisma/client'

export interface RawUser extends User {
  addedByContacts: Contact[]
  contacts: Contact[]
}
