import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { AuthorizationService } from './authorization.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private authService: AuthorizationService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = await this.authService.verifyAccessToken(token)
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = {
        ...payload
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
