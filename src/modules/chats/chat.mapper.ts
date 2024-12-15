import { ChatMember } from '@prisma/client'
import { ChatDTO } from './chats.dto'
import { RawChat } from './chats.types'
import { UserDTOMapper } from '../user/user.mapper'
import { UserDTO } from '../user/user.dto'

export class ChatDTOMapper {
  public static toDTO(raw: RawChat, requesterId: string): ChatDTO {
    const requesterChatMember = this.getChatMember(raw, requesterId)
    const isJoined = this.isJoined(requesterChatMember)
    const privateChatUserDTO = raw.type === 'PRIVATE' ? this.getPrivateChatUserDTO(raw, requesterId) : undefined
    const privateChatMember = privateChatUserDTO ? this.getChatMember(raw, privateChatUserDTO.id) : undefined
    const title = raw.isSavedMessages ? 'Saved Messages' : privateChatUserDTO?.fullName || raw.title
    const theirLastReadMessageSequenceId = privateChatMember
      ? privateChatMember.myLastReadMessageSequenceId
      : this.getTheirLastReadMessageSequenceId(raw, requesterId)
    return new ChatDTO({
      id: privateChatUserDTO ? `u_${privateChatUserDTO.id}` : raw.id,
      _realChatId: raw.id,
      userId: privateChatUserDTO?.id,
      type: raw.type,
      title,
      description: raw.description || undefined,
      color: raw.color,
      createdAt: raw.createdAt,
      membersCount: raw._count.members,
      firstMessageSequenceId: raw.firstMessage?.sequenceId ?? undefined,
      lastMessageSequenceId: raw.lastMessage?.sequenceId ?? undefined,
      myLastReadMessageSequenceId: requesterChatMember?.myLastReadMessageSequenceId ?? undefined,
      theirLastReadMessageSequenceId: theirLastReadMessageSequenceId ?? undefined,
      unreadCount: requesterChatMember?.unreadCount ?? 0,
      isSavedMessages: raw.isSavedMessages,
      isPinned: isJoined ? requesterChatMember.isPinned : false,
      isArchived: isJoined ? requesterChatMember.isArchived : false,
      isMuted: isJoined ? requesterChatMember.isMuted : false,
      isOwner: isJoined ? requesterChatMember.isOwner : false
    })
  }

  public static toDTOList(raws: RawChat[], requesterId: string): ChatDTO[] {
    return raws.map(raw => this.toDTO(raw, requesterId))
  }

  private static getChatMember(raw: RawChat, userId: string): ChatMember | undefined {
    return raw.members.find(member => member.userId === userId)
  }

  private static getTheirLastReadMessageSequenceId(raw: RawChat, requesterId: string): number | undefined {
    const membersExceptRequester = raw.members.filter(member => member.userId !== requesterId)

    const membersLastReadMessageSequenceId = membersExceptRequester
      .map(member => member.myLastReadMessageSequenceId)
      .filter(v => v !== null)

    return membersLastReadMessageSequenceId.length ? Math.max(...membersLastReadMessageSequenceId, 0) : undefined
  }

  private static isJoined(member: ChatMember | undefined): member is ChatMember {
    return Boolean(member)
  }

  private static getPrivateChatUserDTO(raw: RawChat, requesterId: string): UserDTO | undefined {
    const user = raw.members.find(member => member.userId !== requesterId)?.user

    if (user) {
      return UserDTOMapper.toDTO(user, requesterId)
    }
  }
}
