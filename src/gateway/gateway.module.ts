import { Global, Module } from '@nestjs/common'
import { Gateway } from './gateway'

@Global()
@Module({
  providers: [Gateway],
  exports: [Gateway]
})
export class GatewayModule {}
