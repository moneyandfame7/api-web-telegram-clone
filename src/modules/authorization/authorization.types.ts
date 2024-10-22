import { Session } from '@prisma/client'

export interface JwtAccessPayload {
  userId: string
  sessionId: string
}

export interface JwtRefreshPayload {
  userId: string
}

export interface AuthorizationResult {
  accessToken: string
  session: Session
}

export interface AuthorizationPayload extends JwtAccessPayload {
  session: Session
}
