import { Module } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { ChatsController } from './chats.controller'
import { ChatGateway } from './chats.gateway'

@Module({
  providers: [ChatsService, ChatGateway],
  controllers: [ChatsController],
  exports: [ChatsService, ChatGateway]
})
export class ChatsModule {}
