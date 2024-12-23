import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthorizationController } from './authorization.controller'
import { AuthorizationService } from './authorization.service'
import { UsersModule } from '../users/users.module'
import { SessionsModule } from '../sessions/sessions.module'

@Global()
@Module({
  imports: [UsersModule, JwtModule.register({ global: true }), SessionsModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
  exports: [AuthorizationService]
})
export class AuthorizationModule {}
