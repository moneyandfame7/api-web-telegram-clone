import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { isUUID, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import { isUserId } from './chat.helpers'

@Injectable()
export class ChatIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log({ value })

    if (typeof value === 'string') {
      if (isUUID(value)) {
        return value
      }

      if (value.startsWith('u_') && isUUID(value.split('u_')[1])) {
        return value
      }
    }

    throw new BadRequestException('Invalid chat id')
  }
}

export function IsChatId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPalindrome',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false
          return isUUID(value) || isUserId(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a palindrome!`
        }
      }
    })
  }
}
