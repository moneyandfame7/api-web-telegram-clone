import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { JwtAccessPayload } from './authorization.types'
import { SessionService } from '../session/session.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionService
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    console.log('CAN_ACTIVATE', token)
    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload: JwtAccessPayload = await this.jwtService.verifyAsync(token, {
        secret: 'JWT_ACCESS'
      })
      const session = await this.sessionService.findById(payload.sessionId)

      if (!session) {
        throw new BadRequestException('Invalid session id provided')
      }

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = {
        ...payload,
        session
      }
    } catch (error) {
      console.log('ERROR', error)
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Access token is expired')
      }

      throw new UnauthorizedException()
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []

    return type === 'Bearer' ? token : undefined
  }
}
