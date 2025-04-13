import { ChatColor, ChatType } from '@prisma/client'
import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { MessageDTO } from '../messages/messages.dto'
import { Type } from 'class-transformer'

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
  permissions?: ChatPermissionsDTO

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
    permissions?: ChatPermissionsDTO

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
    this.permissions = data.permissions

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

export class ChatPermissionsDTO {
  sendMessages: boolean
  addUsers: boolean
  pinMessages: boolean
  changeInfo: boolean
}

export class AdminPermissionsDTO {
  changeInfo: boolean
  deleteMessages: boolean
  banUsers: boolean
  pinMessages: boolean
  addNewAdmins: boolean
}

export class UpdateAdminDTO {
  @IsUUID()
  chatId: string

  @IsUUID()
  userId: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdminPermissionsDTO)
  adminPermissions: AdminPermissionsDTO | null
}
export class ChatMemberDTO {
  userId: string
  chatId: string
  adminPermissions?: AdminPermissionsDTO
}
export class ChatDetailsDTO {
  chatId: string
  members: ChatMemberDTO[]
  adminIds: string[]
  kickedIds: string[]
}
