import { forwardRef, Module } from '@nestjs/common'

import { AuthorizationModule } from '../authorization/authorization.module'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'

@Module({
  imports: [forwardRef(() => AuthorizationModule)],
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
