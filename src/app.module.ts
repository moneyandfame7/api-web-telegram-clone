import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { ChatsModule } from './modules/chats/chats.module'
import { UserModule } from './modules/user/user.module'
import { AuthorizationModule } from './modules/authorization/authorization.module'
import { SessionModule } from './modules/session/session.module'
import { PrismaModule } from './prisma/prisma.module'
import { ContactsModule } from './modules/contacts/contacts.module'
import { GatewayModule } from './gateway/gateway.module'

@Module({
  imports: [PrismaModule, GatewayModule, SessionModule, AuthorizationModule, ChatsModule, UserModule, ContactsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
