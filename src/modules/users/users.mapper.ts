import { Contact } from '@prisma/client'
import { UserDTO } from './users.dto'
import { RawUser } from './users.types'

/**
 * Кешування:
 * https://chatgpt.com/c/67161f91-2d30-8008-bd74-1d3ccfabd125
 *
 * Створити Map, key - raw.id_requesterId
 * при оновленні raw/requester - очищати за ключем ( endsWith або щось таке)
 */
export class UserDTOMapper {
  public static toDTO(raw: RawUser, requesterId: string): UserDTO {
    const contactRaw = raw.addedByContacts.find(contact => contact.ownerId === requesterId)
    const isRequesterInContacts = raw.contacts.some(contact => contact.contactId === requesterId)
    const isContactExist = this.isDefinedContact(contactRaw)

    return new UserDTO({
      id: raw.id,
      username: raw.username,
      firstName: isContactExist ? contactRaw.firstName : raw.firstName,
      lastName: isContactExist ? contactRaw?.lastName || undefined : raw.lastName || undefined,
      color: raw.color,
      isSelf: raw.id === requesterId,
      isContact: isContactExist,
      isMutualContact: isContactExist && isRequesterInContacts
    })
  }

  public static toDTOList(raws: RawUser[], requesterId: string): UserDTO[] {
    return raws.map(raw => this.toDTO(raw, requesterId))
  }

  private static isDefinedContact(contact: Contact | undefined): contact is Contact {
    return Boolean(contact)
  }
}
