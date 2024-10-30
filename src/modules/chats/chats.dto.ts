import { ChatColor, ChatType } from '@prisma/client'
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'

export class ChatDTO {
  id!: string
  type!: ChatType
  title!: string
  description?: string
  color!: ChatColor
  createdAt!: Date
  membersCount!: number
  isSavedMessages!: boolean
  isPinned!: boolean
  isMuted!: boolean
  isArchived!: boolean
  isOwner!: boolean

  public constructor(data: {
    id: string
    type: ChatType
    title: string
    description?: string
    color: ChatColor
    createdAt: Date
    membersCount: number
    isSavedMessages: boolean
    isPinned: boolean
    isMuted: boolean
    isArchived: boolean
    isOwner: boolean
  }) {
    this.id = data.id
    this.type = data.type
    this.title = data.title
    this.description = data.description
    this.color = data.color
    this.createdAt = data.createdAt
    this.membersCount = data.membersCount
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
