import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Socket } from 'socket.io'
import { AuthorizationService } from './authorization.service'

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthorizationService) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>()

      const userId = client.handshake.query.userId

      client.handshake.query = {
        userId,
        hui: 'pizda'
      }
      return true
    } catch (err) {
      return false
    }
  }
}
