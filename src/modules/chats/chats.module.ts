import { Module } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { ChatsController } from './chats.controller'
import { SessionModule } from '../session/session.module'
import { ChatGateway } from './chats.gateway'

@Module({
  imports: [SessionModule],
  providers: [ChatsService, ChatGateway],
  controllers: [ChatsController],
  exports: [ChatsService, ChatGateway]
})
export class ChatsModule {}
