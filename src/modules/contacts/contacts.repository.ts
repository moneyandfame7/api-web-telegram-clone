import { Injectable } from '@nestjs/common'
import { AddContactDto } from './contacts.dto'
import { userInclude } from '../users/users.constants'
import { RawContact } from './contacts.types'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ContactsRepository {
  public constructor(private prisma: PrismaService) {}

  public async findOne(userId: string, requesterId: string): Promise<RawContact | null> {
    return this.prisma.contact.findFirst({
      where: {
        contactId: userId,
        ownerId: requesterId
      },
      include: {
        contact: {
          include: userInclude
        }
      }
    })
  }

  public async findMany(requesterId: string): Promise<RawContact[]> {
    return this.prisma.contact.findMany({
      where: {
        ownerId: requesterId
      },
      include: {
        contact: {
          include: userInclude
        }
      }
    })
  }

  public async createOne(userId: string, dto: AddContactDto, requesterId: string): Promise<RawContact> {
    return this.prisma.contact.create({
      data: {
        ownerId: requesterId,
        contactId: userId,
        firstName: dto.firstName,
        lastName: dto.lastName
      },
      include: {
        contact: {
          include: userInclude
        }
      }
    })
  }
}
