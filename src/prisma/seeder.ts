import { Chat, PrismaClient, User } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcrypt'
import { randomUUID } from 'crypto'

import { getRandomElement } from '../common/helpers'
import { CHAT_COLORS } from '../modules/chats/chat.constants'

const prisma = new PrismaClient()

class Seeder {
  private readonly jwtService = new JwtService()

  private mockAccounts: User[] = []
  async createMockAccount(data: { firstName: string; username: string; password: string; withSessions: boolean }) {
    const hashedPassword = await hash(data.password, 3)

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        username: data.username,
        password: hashedPassword,
        color: getRandomElement(CHAT_COLORS)
      }
    })
    this.mockAccounts.push(user)
    console.log(`✅ Create mock account. Username: [${data.username}] - Password: [${data.password}]`)
    if (!data.withSessions) {
      return
    }
    for (let k = 0; k < 5; k++) {
      const refreshToken = await this.jwtService.signAsync(
        {
          userId: '123123',
          jti: randomUUID()
        },
        { expiresIn: '60d', secret: 'JWT_REFRESH' }
      )
      await prisma.session.create({
        data: {
          ip: faker.internet.ip(),
          browser: faker.internet.userAgent(),
          location: faker.location.country() + ' ' + faker.location.county(),
          platform: faker.lorem.word(),
          userId: user.id,
          refreshToken
        }
      })
    }
  }

  async createUsers(count = 20) {
    for (let k = 0; k < count; k++) {
      const password = await hash(faker.internet.password(), 3)
      await prisma.user.create({
        data: {
          firstName: faker.person.firstName(),
          username: faker.internet.userName(),
          password,
          lastName: k % 4 === 0 ? faker.person.lastName() : undefined,
          color: getRandomElement(CHAT_COLORS)
        }
      })
    }
    console.log(`✅ Create ${count} users`)
  }

  private generateMessages(chat: Chat, users: [User, User, User]) {
    const MSG_COUNT = 100
    return Array.from({ length: MSG_COUNT }).map((_, index) => ({
      senderId: index % 4 === 0 ? users[0].id : index % 3 === 0 ? users[1].id : users[2].id,
      sequenceId: index,
      text: faker.lorem.paragraph({ min: 1, max: 5 }),
      lastInChatId: index === MSG_COUNT - 1 ? chat.id : undefined,
      firstInChatId: index === 0 ? chat.id : undefined
    }))
  }

  async createChats(count = 20) {
    const admin = await prisma.user.findUniqueOrThrow({ where: { username: 'admin' } })
    const user1 = await prisma.user.findUniqueOrThrow({ where: { username: 'user1' } })
    const user2 = await prisma.user.findUniqueOrThrow({ where: { username: 'user2' } })

    for (let k = 0; k < count; k++) {
      const chat = await prisma.chat.create({
        data: {
          title: faker.internet.displayName(),
          type: 'GROUP',
          color: getRandomElement(CHAT_COLORS),
          isSavedMessages: false,
          chatPermissions: {
            create: {
              addUsers: true,
              changeInfo: true,
              pinMessages: true,
              sendMessages: true
            }
          }
        }
      })
      await prisma.chat.update({
        where: { id: chat.id },
        data: {
          messages: {
            create: this.generateMessages(chat, [admin, user1, user2])
          },
          members: {
            create: [admin, user1, user2].map(user => ({
              userId: user.id,
              isOwner: user.username === 'admin',
              ...(user.username === 'admin' && {
                adminPermissions: {
                  create: {
                    promotedByUserId: user.id
                  }
                }
              })
            }))
          }
        }
      })
    }

    console.log(`✅ Create ${count} chats`)
  }
}

const seed = new Seeder()
async function main() {
  await seed.createMockAccount({ firstName: 'Admin', username: 'admin', password: '12345678', withSessions: true })
  await seed.createMockAccount({ firstName: 'User1', username: 'user1', password: '12345678', withSessions: false })
  await seed.createMockAccount({ firstName: 'User2', username: 'user2', password: '12345678', withSessions: false })
  await seed.createMockAccount({ firstName: 'User3', username: 'user3', password: '12345678', withSessions: false })
  await seed.createMockAccount({ firstName: 'User4', username: 'user4', password: '12345678', withSessions: false })
  await seed.createMockAccount({ firstName: 'User5', username: 'user5', password: '12345678', withSessions: false })
  await seed.createChats()
}

main()
  .catch(e => {
    console.log(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
