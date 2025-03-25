import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserDto } from './users.dto'
import { RawUser } from './users.types'
import { CHAT_COLORS } from '../chats/chat.constants'
import { userInclude } from './users.constants'
import { getRandomElement } from '../../common/helpers'

@Injectable()
export class UsersRepository {
  public constructor(private prisma: PrismaService) {}

  public async create(data: CreateUserDto): Promise<RawUser> {
    return this.prisma.user.create({
      data: {
        ...data,
        color: getRandomElement(CHAT_COLORS)
      },
      include: userInclude
    })
  }

  public async findWhere(where: Prisma.UserWhereUniqueInput): Promise<RawUser | null> {
    return this.prisma.user.findFirst({
      where,
      include: userInclude
    })
  }
}
