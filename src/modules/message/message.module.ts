import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageGateway } from './message.gateway'
import { MessageController } from './mesage.controller'
import { ChatsModule } from '../chats/chats.module'

@Module({
  imports: [ChatsModule],
  controllers: [MessageController],
  providers: [MessageGateway, MessageService]
})
export class MessageModule {}
