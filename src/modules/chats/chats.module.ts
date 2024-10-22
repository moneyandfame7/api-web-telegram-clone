import { Module } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { ChatsController } from './chats.controller'
import { SessionModule } from '../session/session.module'

@Module({
  imports: [SessionModule],
  providers: [ChatsService],
  controllers: [ChatsController]
})
export class ChatsModule {}
