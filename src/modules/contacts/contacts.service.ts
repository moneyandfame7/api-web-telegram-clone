import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { AddContactDto } from './contacts.dto'
import { UsersService } from '../users/users.service'
import { UserDTO } from '../users/users.dto'
import { UserDTOMapper } from '../users/users.mapper'
import { ContactsRepository } from './contacts.repository'

@Injectable()
export class ContactsService {
  public constructor(
    private repository: ContactsRepository,
    private usersService: UsersService
  ) {}

  public async createOne(dto: AddContactDto, requesterId: string): Promise<UserDTO> {
    const user = await this.usersService.findWhereRaw({ username: dto.username })
    if (!user) {
      throw new NotFoundException('User with this username doesn`t exist')
    }

    const existingContact = await this.repository.findOne(user.id, requesterId)

    if (existingContact) {
      throw new ConflictException('Contact already exists')
    }

    const contactEntity = await this.repository.createOne(user.id, dto, requesterId)
    return UserDTOMapper.toDTO(contactEntity.contact, requesterId)
  }

  public async findMany(requesterId: string): Promise<UserDTO[]> {
    const raws = await this.repository.findMany(requesterId)

    return raws.map(raw => UserDTOMapper.toDTO(raw.contact, requesterId))
  }
}
