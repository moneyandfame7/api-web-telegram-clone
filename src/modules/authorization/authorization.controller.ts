import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from './authorization.guard'
import { AuthorizationService } from './authorization.service'
import { RefreshTokenDto, SignInDto, SignUpDto } from './authorization.dto'
import { AuthorizationPayload, AuthorizationResult } from './authorization.types'
import { CurrentAuth } from './authorization.decorator'

@Controller('authorization')
export class AuthorizationController {
  constructor(private service: AuthorizationService) {}

  @Get('/test')
  async test() {
    return 'test'
  }

  @Get('/protected')
  @UseGuards(JwtAuthGuard)
  async protected(@CurrentAuth() auth: AuthorizationPayload) {
    return auth
  }

  @Post('/sign-up')
  async signUp(@Body() dto: SignUpDto): Promise<AuthorizationResult> {
    return this.service.signUp(dto)
  }

  @Post('/sign-in')
  async signIn(@Body() dto: SignInDto): Promise<AuthorizationResult> {
    return this.service.signIn(dto)
  }

  @Post('/refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.service.refresh(dto.refreshToken)
  }

  @Post('/logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<boolean> {
    return this.service.logOut(dto.refreshToken)
  }
}
