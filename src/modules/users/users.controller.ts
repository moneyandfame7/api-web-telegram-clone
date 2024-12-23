import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CheckUsernameDto, UserDTO } from './users.dto'
import { JwtAuthGuard } from '../authorization/authorization.guard'
import { CurrentAuth } from '../authorization/authorization.decorator'
import { AuthorizationPayload } from '../authorization/authorization.types'

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getUser(
    @CurrentAuth() auth: AuthorizationPayload,
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<UserDTO | null> {
    return this.service.findWhere({ id }, auth.userId)
  }

  @Post('/checkUsername')
  public async checkUsername(@Body() dto: CheckUsernameDto): Promise<boolean> {
    return this.service.findWhereRaw({ username: dto.username }).then(user => Boolean(user))
  }
}
