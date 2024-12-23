import { ChatColor, ChatType } from '@prisma/client'
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'
import { MessageDTO } from '../messages/messages.dto'

export class ChatDTO {
  id!: string
  userId?: string
  type!: ChatType
  title!: string
  description?: string
  color!: ChatColor
  createdAt!: Date
  membersCount!: number
  firstMessageSequenceId?: number
  lastMessage?: MessageDTO
  myLastReadMessageSequenceId?: number
  theirLastReadMessageSequenceId?: number
  unreadCount: number

  isSavedMessages!: boolean
  isPinned!: boolean
  isMuted!: boolean
  isArchived!: boolean
  isOwner!: boolean

  public constructor(data: {
    id: string
    userId?: string
    type: ChatType
    title: string
    description?: string
    color: ChatColor
    createdAt: Date
    membersCount: number
    firstMessageSequenceId?: number
    lastMessage?: MessageDTO
    myLastReadMessageSequenceId?: number
    theirLastReadMessageSequenceId?: number
    unreadCount: number
    isSavedMessages: boolean
    isPinned: boolean
    isMuted: boolean
    isArchived: boolean
    isOwner: boolean
  }) {
    this.id = data.id
    this.userId = data.userId
    this.type = data.type
    this.title = data.title
    this.description = data.description
    this.color = data.color
    this.createdAt = data.createdAt
    this.membersCount = data.membersCount
    this.firstMessageSequenceId = data.firstMessageSequenceId
    this.lastMessage = data.lastMessage
    this.myLastReadMessageSequenceId = data.myLastReadMessageSequenceId
    this.theirLastReadMessageSequenceId = data.theirLastReadMessageSequenceId
    this.unreadCount = data.unreadCount
    this.isSavedMessages = data.isSavedMessages
    this.isPinned = data.isPinned
    this.isMuted = data.isMuted
    this.isArchived = data.isArchived
    this.isOwner = data.isOwner
  }
}

export class CreateChatDto {
  @IsEnum(ChatType)
  type!: ChatType

  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsUUID(undefined, { each: true })
  @IsOptional()
  users!: string[]
}

export class TestChatDto {
  @IsString()
  title: string

  @IsUUID(undefined, { each: true })
  @IsOptional()
  users!: string[]
}
