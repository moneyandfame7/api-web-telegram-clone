import { IsString, IsUUID } from 'class-validator'

export class MessageDTO {
  id: string
  orderedId: number
  chatId: string
  senderId: string
  text?: string
  createdAt: Date
  editedAt?: Date

  isOutgoing: boolean
  isSilent: boolean
  constructor(data: {
    id: string
    orderedId: number
    chatId: string
    senderId: string
    text?: string
    createdAt: Date
    editedAt?: Date
    isOutgoing: boolean
    isSilent: boolean
  }) {
    this.id = data.id
    this.orderedId = data.orderedId
    this.chatId = data.chatId
    this.senderId = data.senderId
    this.text = data.text
    this.createdAt = data.createdAt
    this.editedAt = data.editedAt
    this.isOutgoing = data.isOutgoing
    this.isSilent = data.isSilent
  }
}
export class SendMessageDTO {
  @IsUUID()
  chatId: string
  @IsString()
  text: string
}
