import { MessageDTO } from './message.dto'
import { RawMessage } from './message.types'

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
}
