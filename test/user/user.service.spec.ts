import { Test, TestingModule } from '@nestjs/testing'

import { UsersService } from '../../src/modules/users/users.service'
import { UserDTO } from '../../src/modules/users/users.dto'
import { RawUser } from '../../src/modules/users/users.types'
import { UsersRepository } from '../../src/modules/users/users.repository'
import { UserDTOMapper } from '../../src/modules/users/users.mapper'

describe('UserService', () => {
  let mockUserService: UsersService
  const mockUserRepository = {
    findWhere: jest.fn(),
    create: jest.fn(),
    prisma: jest.fn()
  }

  const mockUserRaw: RawUser = {
    id: '123',
    firstName: 'First name',
    lastName: null,
    username: 'username',
    color: 'BLUE',
    password: '123123',
    createdAt: new Date(),
    addedByContacts: [],
    contacts: []
  }
  const mockUserDTO: UserDTO = new UserDTO({
    id: '123',
    firstName: 'First name',
    username: 'username',
    color: 'BLUE',
    isContact: false,
    isMutualContact: false,
    isSelf: false
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUserRepository
        }
      ]
    }).compile()

    mockUserService = module.get(UsersService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findWhere', () => {
    const requesterId = '777'
    const where = {
      username: 'lololorers'
    }

    it('should find and return UserDTO by provided "whereInput"', async () => {
      mockUserRepository.findWhere.mockResolvedValue(mockUserRaw)
      const dtoMapper = jest.spyOn(UserDTOMapper, 'toDTO').mockReturnValue(mockUserDTO)

      const result = await mockUserService.findWhere(where, requesterId)

      expect(mockUserRepository.findWhere).toHaveBeenCalledWith(where)
      expect(dtoMapper).toHaveBeenCalledWith(mockUserRaw, requesterId)
      expect(result).toEqual(mockUserDTO)
    })

    it('should return null when is not founded', async () => {
      mockUserRepository.findWhere.mockResolvedValue(null)

      const result = await mockUserService.findWhere(where, requesterId)

      expect(mockUserRepository.findWhere).toHaveBeenCalledWith(where)
      expect(UserDTOMapper.toDTO).not.toHaveBeenCalled()
      expect(result).toEqual(null)
    })
  })
})
