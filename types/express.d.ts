import type { AuthorizationPayload } from '../src/modules/authorization/authorization.types'

declare module 'express' {
  export interface Request {
    user?: AuthorizationPayload
  }
}
