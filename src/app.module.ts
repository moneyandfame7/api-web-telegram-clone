import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { ChatsModule } from './modules/chats/chats.module'
import { UsersModule } from './modules/users/users.module'
import { AuthorizationModule } from './modules/authorization/authorization.module'
import { SessionsModule } from './modules/sessions/sessions.module'
import { PrismaModule } from './prisma/prisma.module'
import { ContactsModule } from './modules/contacts/contacts.module'
import { GatewayModule } from './gateway/gateway.module'
import { MessagesModule } from './modules/messages/messages.module'

@Module({
  imports: [
    PrismaModule,
    GatewayModule,
    SessionsModule,
    AuthorizationModule,
    ChatsModule,
    UsersModule,
    ContactsModule,
    MessagesModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
