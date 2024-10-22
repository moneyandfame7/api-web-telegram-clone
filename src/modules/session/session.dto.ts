import { IsJWT } from 'class-validator'
import { DeviceInfoDto } from '../authorization/authorization.dto'

export class CreateSessionDto extends DeviceInfoDto {
  @IsJWT()
  refreshToken!: string
}
