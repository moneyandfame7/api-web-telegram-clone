import { HttpException, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { BaseError } from '../common/errors/error-code.enum'

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient()
    this.handleError(client, exception)
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    console.log('EXCEPTION', exception)

    if (exception instanceof BaseError) {
      console.log('BASE_ERROR')

      client.emit('exception', exception.getResponse())
    } else if (exception instanceof HttpException) {
      // handle http exception

      console.log(exception.getResponse(), 'HTTP_EXCP')

      client.emit('exception', {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        details: ['lalla']
      })
    } else {
      // handle websocket exception

      client.emit('exception', {
        name: exception.name,
        message: exception.getError(),
        stack: exception.stack,
        details: ['lalla']
      })
    }
  }
}

@Catch(WsException, HttpException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>()
    const data = host.switchToWs().getData()
    const error = exception instanceof WsException ? exception.getError() : exception.getResponse()
    const details = error instanceof Object ? { ...error } : { message: error }
    client.emit('exception', error)
  }
}
