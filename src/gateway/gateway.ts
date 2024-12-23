import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { AuthorizationService } from '../modules/authorization/authorization.service'
import { TypedSocket, SocketInfo, TypedServer } from './gateway.types'
import { SocketsManager } from './socket-clients.manager'
import { UnauthorizedException } from '@nestjs/common'
import { ErrorCode } from '../common/errors/error-code.enum'
import { TokenExpiredError } from '@nestjs/jwt'

// що якщо юзер підключатиметься з двох девайсів? одразу
@WebSocketGateway({ cors: true })
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: TypedServer
  public clientsManager = new SocketsManager()

  public constructor(private authorizationService: AuthorizationService) {}

  async afterInit(server: TypedServer) {
    server.use(async (socket, next) => {
      try {
        console.log('MIDDLEWARE', socket.id)
        const token: string | undefined = socket.handshake.auth?.token
        if (!token) {
          return next(new UnauthorizedException(ErrorCode.AUTH_TOKEN_MISSING))
        }

        const payload = await this.authorizationService.verifyAccessToken(token)

        socket = Object.assign(socket, {
          userId: payload.userId,
          sessionId: payload.sessionId
        })

        const socketInfo: SocketInfo = {
          sessionId: payload.sessionId,
          socketId: socket.id
        }
        socket.data = {
          userId: payload.userId,
          sessionId: payload.sessionId
        }
        this.clientsManager.addClient(payload.userId, socketInfo)

        next()
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          next(new UnauthorizedException(ErrorCode.AUTH_TOKEN_EXPIRED))
        } else {
          next(new Error('UNKNOWN ERROR'))
        }
      }
    })
  }

  async handleConnection(client: TypedSocket, ...args: any[]) {
    console.log('CONNECT', client.id, client.userId, client.sessionId)
    console.log([...this.clientsManager.getActiveClients()][0][1])
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id)

    this.clientsManager.removeClient(client.id)
  }

  @SubscribeMessage('join')
  async join(client: Socket, roomName: string) {
    console.log(`user ${client.data?.userId} joined to room [${roomName}]`)
    // client.handshake.query.userId
    // console.log('QUERY:', client.handshake.query, 'ROOM:', roomName)
    client.join(roomName)
  }
}
