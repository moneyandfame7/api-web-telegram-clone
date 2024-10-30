import { ChatColor } from '@prisma/client'
import { IsOptional, IsString, MinLength } from 'class-validator'

export class UserDTO {
  id: string
  username: string
  firstName: string
  lastName?: string
  color: ChatColor
  /**
   * dto mapping
   */
  isSelf: boolean
  isContact: boolean
  isMutualContact: boolean

  public constructor(data: {
    id: string
    username: string
    firstName: string
    lastName?: string
    color: ChatColor
    isSelf: boolean
    isContact: boolean
    isMutualContact: boolean
  }) {
    this.id = data.id
    this.username = data.username
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.color = data.color
    this.isSelf = data.isSelf
    this.isContact = data.isContact
    this.isMutualContact = data.isMutualContact
  }

  get fullName() {
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`
  }
}

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username!: string
  @IsString()
  firstName!: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsString()
  password!: string
}

export class CheckUsernameDto {
  @IsString()
  username!: string
}
