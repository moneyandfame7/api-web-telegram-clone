import { Injectable } from '@nestjs/common'
import { Prisma, Session } from '@prisma/client'

import { CreateSessionDto } from './session.dto'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class SessionRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async createOne(data: CreateSessionDto, userId: string) {
    return this.prisma.session.create({
      data: {
        ...data,
        userId
      }
    })
  }

  public async findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } })
  }

  public async findWhere(where: Prisma.SessionWhereUniqueInput): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where
    })
  }

  public async delete(where: Prisma.SessionWhereUniqueInput): Promise<boolean> {
    const deleted = await this.prisma.session.delete({ where })

    return Boolean(deleted)
  }
}
