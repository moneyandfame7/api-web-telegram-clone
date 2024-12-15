import { Test, TestingModule } from '@nestjs/testing'
import { MessageService } from '../../src/modules/message/message.service'
import { GetMessagesDirection, RawMessage } from '../../src/modules/message/message.types'
import { GetMessagesDTO } from '../../src/modules/message/message.dto'
import { PrismaService } from '../../src/prisma/prisma.service'
import { BadRequestException } from '@nestjs/common'

const getMessagesDto: GetMessagesDTO = {
  chatId: 'chatId',
  direction: GetMessagesDirection.NEWER,
  limit: 20,
  skipCursor: false
}
const mockPrisma = {
  message: {
    findMany: jest.fn()
  }
}
describe('MessageService', () => {
  let mockMessageService: MessageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: PrismaService,
          useValue: mockPrisma
        }
      ]
    }).compile()

    mockMessageService = module.get(MessageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should throw BadRequestException when sequenceId is undefined and direction is AROUND', async () => {
    getMessagesDto.direction = GetMessagesDirection.AROUND
    getMessagesDto.sequenceId = undefined

    await expect(mockMessageService.getMessages(getMessagesDto, 'requesterId')).rejects.toThrow(
      new BadRequestException('Sequence id is not provided')
    )
    getMessagesDto.direction = GetMessagesDirection.NEWER
  })

  it('should return an array of message DTOs', async () => {
    mockPrisma.message.findMany.mockResolvedValue([
      {
        chatId: 'chatId',
        createdAt: new Date(),
        editedAt: new Date(),
        firstInChatId: 'chatId',
        id: 'messageId',
        senderId: 'senderId',
        lastInChatId: 'chatId',
        sequenceId: 0,
        text: 'Text '
      }
    ] satisfies Array<RawMessage>)
    const result = await mockMessageService.getMessages(getMessagesDto, 'requesterId')
  })
})
