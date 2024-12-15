import { ChatDTO } from '../chats/chats.dto'
import { MessageDTO } from './message.dto'
import { RawMessage } from './message.types'

export class MessageDTOMapper {
  public static toDTO(raw: RawMessage, chatDto: ChatDTO, requesterId: string): MessageDTO {
    const { lastInChatId, ...primaryFields } = raw

    return new MessageDTO({
      ...primaryFields,
      chatId: chatDto.id,
      text: primaryFields.text ?? undefined,
      editedAt: primaryFields.editedAt ?? undefined,
      isOutgoing: primaryFields.senderId === requesterId,
      isSilent: false
    })
  }

  public static toDTOList(raws: RawMessage[], chatDto: ChatDTO, requesterId: string): MessageDTO[] {
    return raws.map(raw => this.toDTO(raw, chatDto, requesterId))
  }
}
