import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { CreateUserDto, UserDTO } from './users.dto'
import { UsersRepository } from './users.repository'
import { RawUser } from './users.types'
import { UserDTOMapper } from './users.mapper'

@Injectable()
export class UsersService {
  constructor(private repository: UsersRepository) {}

  public async findWhere(where: Prisma.UserWhereUniqueInput, requesterId: string): Promise<UserDTO | null> {
    const raw = await this.repository.findWhere(where)

    if (raw) {
      return UserDTOMapper.toDTO(raw, requesterId)
    }

    return null
  }
  public async findWhereRaw(where: Prisma.UserWhereUniqueInput): Promise<RawUser | null> {
    return this.repository.findWhere(where)
  }

  public async createRaw(data: CreateUserDto): Promise<RawUser> {
    return this.repository.create(data)
  }
}
