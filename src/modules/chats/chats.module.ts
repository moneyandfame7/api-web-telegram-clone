import { Module } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { ChatsController } from './chats.controller'
import { SessionsModule } from '../sessions/sessions.module'
import { ChatGateway } from './chats.gateway'

@Module({
  imports: [SessionsModule],
  providers: [ChatsService, ChatGateway],
  controllers: [ChatsController],
  exports: [ChatsService, ChatGateway]
})
export class ChatsModule {}
