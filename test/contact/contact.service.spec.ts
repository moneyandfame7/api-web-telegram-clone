import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'

import { UserService } from '../../src/modules/user/user.service'
import { UserDTOMapper } from '../../src/modules/user/user.mapper'
import { UserDTO } from '../../src/modules/user/user.dto'
import { RawUser } from '../../src/modules/user/user.types'

import { ContactsService } from '../../src/modules/contacts/contacts.service'
import { ContactsRepository } from '../../src/modules/contacts/contacts.repository'
import { RawContact } from '../../src/modules/contacts/contacts.types'

const requesterId = 'requester-id'

const mockUserRaw: RawUser = {
  id: '1',
  firstName: 'First name',
  lastName: null,
  username: 'username',
  color: 'BLUE',
  password: '123123',
  createdAt: new Date(),
  addedByContacts: [],
  contacts: []
}
const createContactDto = {
  firstName: 'Contact firstname',
  lastName: 'Contact lastname',
  username: mockUserRaw.username
}

const mockContactRaw: RawContact = {
  id: 'contact-id',
  contact: mockUserRaw,
  contactId: mockUserRaw.id,
  firstName: createContactDto.firstName,
  lastName: createContactDto.lastName,
  ownerId: requesterId
}

const userDto = new UserDTO({
  id: mockUserRaw.id,
  firstName: createContactDto.firstName,
  lastName: createContactDto.lastName,
  username: createContactDto.username,
  color: mockUserRaw.color,
  isContact: true,
  isMutualContact: false,
  isSelf: false
})
const mockUserService = {
  findWhereRaw: jest.fn().mockResolvedValue(mockUserRaw)
}
const mockContactRepository = {
  findOne: jest.fn().mockResolvedValue(null),
  createOne: jest.fn().mockResolvedValue(mockContactRaw),
  findMany: jest.fn().mockResolvedValue([mockContactRaw])
}
describe('ContactService', () => {
  let contactService: ContactsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: ContactsRepository,
          useValue: mockContactRepository
        },
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    }).compile()

    contactService = module.get(ContactsService)
  })

  describe('createOne', () => {
    it('should create the contact successfully', async () => {
      const userDTOMapperSpy = jest.spyOn(UserDTOMapper, 'toDTO').mockReturnValue(userDto)
      const result = await contactService.createOne(createContactDto, requesterId)

      expect(mockUserService.findWhereRaw).toHaveBeenCalledWith({
        username: createContactDto.username
      })
      expect(mockContactRepository.findOne).toHaveBeenCalledWith(mockUserRaw.id, requesterId)
      expect(mockContactRepository.createOne).toHaveBeenCalledWith(mockUserRaw.id, createContactDto, requesterId)
      expect(userDTOMapperSpy).toHaveBeenCalledWith(mockContactRaw.contact, requesterId)

      expect(result.isContact).toEqual(true)
      expect(result.firstName).toEqual(createContactDto.firstName)
      expect(result.lastName).toEqual(createContactDto.lastName)
    })
    it('should throw NotFoundException when user with provided username is not found', async () => {
      mockUserService.findWhereRaw.mockResolvedValueOnce(null)

      await expect(contactService.createOne(createContactDto, requesterId)).rejects.toThrow(
        new NotFoundException('User with this username doesn`t exist')
      )
    })

    it('should throw ConflictException when contact already exists', async () => {
      mockContactRepository.findOne.mockResolvedValueOnce(mockContactRaw)

      await expect(contactService.createOne(createContactDto, requesterId)).rejects.toThrow(
        new ConflictException('Contact already exists')
      )
    })
  })

  describe('findMany', () => {
    it('should return an array of user DTOs', async () => {
      const dtoMapperSpy = jest.spyOn(UserDTOMapper, 'toDTO').mockReturnValue(userDto)
      const res = await contactService.findMany(requesterId)

      expect(mockContactRepository.findMany).toHaveBeenCalledWith(requesterId)
      expect(dtoMapperSpy).toHaveBeenCalledWith(mockContactRaw.contact, requesterId)
      expect(res).toEqual([userDto])
    })
  })
})
