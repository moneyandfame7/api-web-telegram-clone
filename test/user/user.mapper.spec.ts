import { UserDTOMapper } from '../../src/modules/user/user.mapper'
import { RawUser } from '../../src/modules/user/user.types'

describe('UserDTOMapper', () => {
  const mockUserRaw: RawUser = {
    id: '123',
    firstName: 'First name',
    lastName: 'Mock lastname',
    username: 'username',
    color: 'BLUE',
    password: '123123',
    createdAt: new Date(),
    addedByContacts: [],
    contacts: []
  }
  const requester = { id: 'requester-id' }
  const mockRequesterContact = {
    ownerId: requester.id,
    contactId: mockUserRaw.id,
    firstName: 'UserRaw is in contacts',
    lastName: null,
    id: '000'
  }
  const mockUserContact = {
    ownerId: mockUserRaw.id,
    contactId: requester.id,
    firstName: 'Requester is in contacts',
    lastName: null,
    id: '000'
  }

  it('should correctly map when raw is requester', () => {
    const result = UserDTOMapper.toDTO(mockUserRaw, mockUserRaw.id)

    expect(result.isSelf).toEqual(true)
    expect(result.isContact).toEqual(false)
    expect(result.isMutualContact).toEqual(false)
    expect(result.firstName).toEqual(mockUserRaw.firstName)
    expect(result.lastName).toEqual(mockUserRaw.lastName)
    expect(result.username).toEqual(mockUserRaw.username)
  })

  it('should correctly map when raw is in contact by requester', () => {
    const updatedMockUserRaw: RawUser = {
      ...mockUserRaw,
      addedByContacts: [mockRequesterContact]
    }
    const result = UserDTOMapper.toDTO(updatedMockUserRaw, requester.id)

    expect(result.isContact).toEqual(true)

    /**
     * "First name" --> "UserRaw is in contacts"
     */
    expect(result.firstName).toEqual(mockRequesterContact.firstName)

    /**
     * mockRequesterContact.lastName - null
     */
    expect(result.lastName).toBeUndefined()
  })

  it('should correclty map when requester is a mutual contact with raw', () => {
    const updatedMockUserRaw: RawUser = {
      ...mockUserRaw,
      addedByContacts: [mockRequesterContact],
      contacts: [mockUserContact]
    }

    const result = UserDTOMapper.toDTO(updatedMockUserRaw, requester.id)

    expect(result.isContact).toEqual(true)
    expect(result.isMutualContact).toEqual(true)
  })
})
