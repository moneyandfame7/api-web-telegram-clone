import { Contact } from '@prisma/client'
import { RawUser } from '../user/user.types'

export interface RawContact extends Contact {
  contact: RawUser
}
