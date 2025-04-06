import { MessageDTO } from './messages.dto'
import { RawMessage } from './messages.types'

export class MessageDTOMapper {
  public static toDTO(raw: RawMessage, requesterId: string): MessageDTO {
    const { /* lastInChatId = undefined, */ ...primaryFields } = raw
    if (primaryFields.replyToMessage) {
      console.log({ primaryFields })
    }
    return new MessageDTO({
      ...primaryFields,
      text: primaryFields.text ?? undefined,
      editedAt: primaryFields.editedAt ?? undefined,
      replyInfo: primaryFields.replyToMessage
        ? {
            id: primaryFields.replyToMessage.id,
            sequenceId: primaryFields.replyToMessage.sequenceId,
            senderId: primaryFields.replyToMessage.sender.id,
            text: primaryFields.replyToMessage.text ?? undefined
          }
        : undefined,
      forwardInfo: primaryFields.forwardFromMessage
        ? {
            id: primaryFields.forwardFromMessage.id,
            sequenceId: primaryFields.forwardFromMessage.sequenceId,
            senderId: primaryFields.forwardFromMessage.sender.id,
            text: primaryFields.forwardFromMessage.text ?? undefined,
            fromChatId: primaryFields.forwardFromMessage.chatId
          }
        : undefined,
      isOutgoing: primaryFields.senderId === requesterId,
      isSilent: false
    })
  }

  public static toDTOList(raws: RawMessage[], requesterId: string): MessageDTO[] {
    return raws.map(raw => this.toDTO(raw, requesterId))
  }
}
