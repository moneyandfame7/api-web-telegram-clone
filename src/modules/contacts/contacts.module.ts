import { ContactsRepository } from './contacts.repository'
import { Module } from '@nestjs/common'
import { ContactsController } from './contacts.controller'
import { ContactsService } from './contacts.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [UserModule],
  controllers: [ContactsController],
  providers: [ContactsRepository, ContactsService]
})
export class ContactsModule {}
