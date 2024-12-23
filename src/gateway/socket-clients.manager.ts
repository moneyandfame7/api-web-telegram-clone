import { SocketInfo } from './gateway.types'

export class SocketsManager {
  /**
   * {userId: SocketInfo[]}
   */
  private clientsMap = new Map<string, SocketInfo[]>()

  public getActiveClients() {
    return this.clientsMap.entries()
  }

  public getClients(userId: string): SocketInfo[] | undefined {
    return this.clientsMap.get(userId)
  }

  public addClient(userId: string, info: SocketInfo) {
    if (this.clientsMap.has(userId)) {
      this.clientsMap.get(userId)?.push(info)
    } else {
      this.clientsMap.set(userId, [info])
    }
  }

  public removeClient(socketId: string) {
    for (let [userId, clients] of this.clientsMap.entries()) {
      const existedClient = clients.find(info => info.socketId === socketId)

      if (!existedClient) {
        continue
      }

      const filteredClients = clients.filter(info => info.socketId !== socketId)

      if (filteredClients.length > 0) {
        this.clientsMap.set(userId, filteredClients)
      } else {
        this.clientsMap.delete(userId)
      }
    }
  }
}
