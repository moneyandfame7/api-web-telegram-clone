import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'

import { UserDTO } from '../users/users.dto'

import { JwtAuthGuard } from '../authorization/authorization.guard'
import { CurrentAuth } from '../authorization/authorization.decorator'
import { AuthorizationPayload } from '../authorization/authorization.types'

import { AddContactDto } from './contacts.dto'
import { ContactsService } from './contacts.service'

@Controller('/contacts')
export class ContactsController {
  public constructor(private service: ContactsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  public async createOne(@CurrentAuth() auth: AuthorizationPayload, @Body() dto: AddContactDto): Promise<UserDTO> {
    return this.service.createOne(dto, auth.userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async findMany(@CurrentAuth() auth: AuthorizationPayload): Promise<UserDTO[]> {
    return this.service.findMany(auth.userId)
  }

  public async edit() {}

  public async delete() {}
}
