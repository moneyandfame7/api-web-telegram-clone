import { Type } from 'class-transformer'
import { /*  IsIP,  */ IsJWT, IsNotEmpty, MaxLength, MinLength, ValidateNested } from 'class-validator'

export class DeviceInfoDto {
  // @IsIP()
  ip!: string

  @IsNotEmpty()
  browser!: string

  @IsNotEmpty()
  platform!: string

  @IsNotEmpty()
  location!: string
}

export class SignUpDto {
  @MinLength(3)
  @MaxLength(50)
  readonly username!: string

  @MinLength(8)
  readonly password!: string

  @MinLength(8)
  readonly passwordConfirm!: string

  @IsNotEmpty()
  readonly firstName!: string

  readonly lastName?: string

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DeviceInfoDto)
  readonly deviceInfo!: DeviceInfoDto
}

export class SignInDto {
  public readonly username!: string

  public readonly password!: string

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DeviceInfoDto)
  deviceInfo!: DeviceInfoDto
}
export class RefreshTokenDto {
  @IsJWT()
  public readonly refreshToken!: string
}
