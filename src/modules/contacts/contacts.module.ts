import { ContactsRepository } from './contacts.repository'
import { Module } from '@nestjs/common'
import { ContactsController } from './contacts.controller'
import { ContactsService } from './contacts.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],
  controllers: [ContactsController],
  providers: [ContactsRepository, ContactsService]
})
export class ContactsModule {}
