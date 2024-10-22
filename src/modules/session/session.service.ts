import { Injectable } from '@nestjs/common'

import { Prisma, Session } from '@prisma/client'

import { CreateSessionDto } from './session.dto'
import { SessionRepository } from './session.repository'

@Injectable()
export class SessionService {
  constructor(private readonly repository: SessionRepository) {}

  async createOne(dto: CreateSessionDto, userId: string) {
    return this.repository.createOne(dto, userId)
  }

  async findById(id: string): Promise<Session | null> {
    return this.repository.findById(id)
  }

  public async findWhere(where: Prisma.SessionWhereUniqueInput): Promise<Session | null> {
    return this.repository.findWhere(where)
  }

  public async delete(where: Prisma.SessionWhereUniqueInput): Promise<boolean> {
    return this.repository.delete(where)
  }

  public async deleteAllByUser(currentSession: Session) {}
}
