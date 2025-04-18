import { Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { MessagesGateway } from './messages.gateway'
import { MessagesController } from './messages.controller'
import { ChatsModule } from '../chats/chats.module'

@Module({
  imports: [ChatsModule],
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService]
})
export class MessagesModule {}
