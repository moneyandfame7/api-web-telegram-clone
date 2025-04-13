import { Global, Module } from '@nestjs/common'
import { Gateway } from './gateway'
import { ChatsModule } from '../modules/chats/chats.module'

@Global()
@Module({
  imports: [ChatsModule],
  providers: [Gateway],
  exports: [Gateway]
})
export class GatewayModule {}
