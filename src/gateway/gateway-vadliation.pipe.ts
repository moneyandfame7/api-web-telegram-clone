import { HttpException, Catch, ArgumentsHost, BadRequestException, ValidationPipe } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { BaseError, ValidationError } from '../common/errors/error-code.enum'
import { ValidationError as DTOValidationError } from 'class-validator'
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

export class GatewayValidationPipe extends ValidationPipe {
  constructor() {
    super({
      stopAtFirstError: true,
      exceptionFactory(validationErrors: DTOValidationError[] = []) {
        // Here are the errors
        if (this.isDetailedOutputDisabled) {
          return new WsException('Bad Request')
        }
        const errors = this.flattenValidationErrors(validationErrors)

        return new ValidationError(errors)
      }
    })
  }
}
