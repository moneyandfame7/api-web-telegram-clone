import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { GetMessagesDirection } from './messages.types'
import { Transform, Type } from 'class-transformer'
import { IsChatId } from '../chats/chat.pipes'

export class MessageDTO {
  id: string
  sequenceId: number
  chatId: string
  senderId: string
  text?: string
  createdAt: Date
  editedAt?: Date

  isOutgoing: boolean
  isSilent: boolean
  constructor(data: {
    id: string
    sequenceId: number
    chatId: string
    senderId: string
    text?: string
    createdAt: Date
    editedAt?: Date
    isOutgoing: boolean
    isSilent: boolean
  }) {
    this.id = data.id
    this.sequenceId = data.sequenceId
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
  @IsChatId()
  chatId: string

  @IsString()
  text: string
}

export class GetMessagesDTO {
  @IsUUID()
  chatId: string

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sequenceId?: number

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1)
  skipCursor: boolean = true

  @IsEnum(GetMessagesDirection)
  @IsOptional()
  direction: GetMessagesDirection = GetMessagesDirection.OLDER

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number = 20
}

export class ReadHistoryDTO {
  @IsUUID()
  chatId: string
  @IsInt()
  maxId: number
}
