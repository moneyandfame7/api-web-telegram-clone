import { forwardRef, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthorizationController } from './authorization.controller'
import { AuthorizationService } from './authorization.service'
import { UserModule } from '../user/user.module'
import { SessionModule } from '../session/session.module'

@Module({
  imports: [forwardRef(() => UserModule), JwtModule.register({ global: true }), SessionModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService]
})
export class AuthorizationModule {}
