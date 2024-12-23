import { ChatDTO } from '../chats/chats.dto'
import { MessageDTO } from './messages.dto'
import { RawMessage } from './messages.types'

export class MessageDTOMapper {
  public static toDTO(raw: RawMessage, requesterId: string): MessageDTO {
    const { lastInChatId, ...primaryFields } = raw

    return new MessageDTO({
      ...primaryFields,
      text: primaryFields.text ?? undefined,
      editedAt: primaryFields.editedAt ?? undefined,
      isOutgoing: primaryFields.senderId === requesterId,
      isSilent: false
    })
  }

  public static toDTOList(raws: RawMessage[], requesterId: string): MessageDTO[] {
    return raws.map(raw => this.toDTO(raw, requesterId))
  }
}
