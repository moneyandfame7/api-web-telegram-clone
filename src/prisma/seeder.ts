import { PrismaClient, User } from '@prisma/client'
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

  async createUsers(count = 100) {
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

  async createChatsAndConnect(count = 20) {
    for (let k = 0; k < count; k++) {
      await prisma.chat.create({
        data: {
          title: faker.internet.displayName(),
          type: 'GROUP',
          color: getRandomElement(CHAT_COLORS),
          isSavedMessages: false,
          members: {
            create: this.mockAccounts.map((user, i) => ({
              userId: user.id,
              isOwner: getRandomElement(this.mockAccounts).id === user.id
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

  await seed.createMockAccount({ firstName: 'Davyd', username: 'moneyandfame', password: '12345678', withSessions: false })

  await seed.createUsers()

  await seed.createChatsAndConnect()
}

main()
  .catch(e => {
    console.log(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
