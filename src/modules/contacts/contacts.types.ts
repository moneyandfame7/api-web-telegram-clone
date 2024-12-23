import { Contact } from '@prisma/client'
import { RawUser } from '../users/users.types'

export interface RawContact extends Contact {
  contact: RawUser
}
