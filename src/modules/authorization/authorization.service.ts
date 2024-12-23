import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'

import { DeviceInfoDto, SignInDto, SignUpDto } from './authorization.dto'
import { AuthorizationPayload, AuthorizationResult, JwtAccessPayload, JwtRefreshPayload } from './authorization.types'

import { UserService } from '../user/user.service'
import { SessionService } from '../session/session.service'
import { RawUser } from '../user/user.types'

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly sessionService: SessionService
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthorizationResult> {
    const { deviceInfo, username, firstName, lastName, password, passwordConfirm } = dto

    const existedUser = await this.userService.findWhereRaw({ username })

    if (existedUser) {
      throw new BadRequestException('This username already in use')
    }

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords don`t match')
    }
    const hashedPassword = await bcrypt.hash(password, 3)

    const createdUser = await this.userService.createRaw({
      username,
      firstName,
      lastName,
      password: hashedPassword
    })

    return this.createAuthorization(createdUser, deviceInfo)
  }

  async signIn(dto: SignInDto): Promise<AuthorizationResult> {
    const { deviceInfo, password, username } = dto

    const user = await this.userService.findWhereRaw({ username })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      throw new BadRequestException('Incorrect password')
    }

    return this.createAuthorization(user, deviceInfo)
  }

  async refresh(refreshToken: string): Promise<string> {
    const session = await this.sessionService.findWhere({ refreshToken })

    if (!session) {
      throw new BadRequestException('Session is invalid')
    }

    if (refreshToken !== session.refreshToken) {
      throw new BadRequestException('Invalid refresh token')
    }

    const payload = await this.verifyRefreshToken(refreshToken)

    const user = await this.userService.findWhereRaw({ id: payload.userId })

    if (!user) {
      throw new BadRequestException('Invalid refresh token')
    }

    return this.generateAccessToken({ userId: user.id, sessionId: session.id })
  }

  public async logOut(refreshToken: string): Promise<boolean> {
    await this.sessionService.delete({ refreshToken })

    return true
  }

  public async verifyAccessToken(token: string): Promise<AuthorizationPayload> {
    const payload: JwtAccessPayload = await this.jwtService.verifyAsync(token, {
      secret: 'JWT_ACCESS'
    })
    const session = await this.sessionService.findById(payload.sessionId)

    if (!session) {
      throw new BadRequestException('Invalid session id provided')
    }

    return { ...payload, session }
  }

  private async verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(token, { secret: 'JWT_REFRESH' })
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestException('Refresh token is expired')
      }
      throw new BadRequestException('Invalid refresh token')
    }
  }

  private async createAuthorization(user: RawUser, deviceInfo: DeviceInfoDto): Promise<AuthorizationResult> {
    const refreshToken = await this.generateRefreshToken({ userId: user.id })

    const session = await this.sessionService.createOne({ ...deviceInfo, refreshToken }, user.id)

    const accessToken = await this.generateAccessToken({ userId: user.id, sessionId: session.id })

    return {
      accessToken,
      session
    }
  }

  public async generateAccessToken(payload: JwtAccessPayload) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '60m',
      secret: 'JWT_ACCESS'
    })
  }

  public async generateRefreshToken(payload: JwtRefreshPayload) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '60d',
      secret: 'JWT_REFRESH'
    })
  }
}
