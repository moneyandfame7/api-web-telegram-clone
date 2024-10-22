import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { AuthorizationPayload } from './authorization.types'

export const CurrentAuth = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthorizationPayload => {
  const request: Request = ctx.switchToHttp().getRequest()

  const payload = request.user

  if (!payload) {
    throw new UnauthorizedException()
  }

  return payload
})
