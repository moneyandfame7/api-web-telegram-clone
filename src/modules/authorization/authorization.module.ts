import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthorizationController } from './authorization.controller'
import { AuthorizationService } from './authorization.service'
import { UserModule } from '../user/user.module'
import { SessionModule } from '../session/session.module'

@Global()
@Module({
  imports: [UserModule, JwtModule.register({ global: true }), SessionModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
  exports: [AuthorizationService]
})
export class AuthorizationModule {}
