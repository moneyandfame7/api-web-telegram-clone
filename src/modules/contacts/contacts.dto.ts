import { IsOptional, IsString } from 'class-validator'

export class AddContactDto {
  @IsString()
  username!: string

  @IsString()
  firstName!: string

  @IsOptional()
  @IsString()
  lastName?: string
}
