import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserDto } from './user.dto'
import { RawUser } from './user.types'
import { CHAT_COLORS } from '../chats/chat.constants'
import { userIncludes } from './user.constants'
import { getRandomElement } from '../../common/helpers'

@Injectable()
export class UserRepository {
  public constructor(private prisma: PrismaService) {}

  public async create(data: CreateUserDto): Promise<RawUser> {
    return this.prisma.user.create({
      data: {
        ...data,
        color: getRandomElement(CHAT_COLORS)
      },
      include: userIncludes
    })
  }

  public async findWhere(where: Prisma.UserWhereUniqueInput): Promise<RawUser | null> {
    return this.prisma.user.findFirst({
      where,
      include: userIncludes
    })
  }
}
