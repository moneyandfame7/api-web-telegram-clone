export const EVENTS = {
  CHAT: (id: string) => ({
    CREATE: `chat-${id}:create`,
    EDIT: `chat-${id}:edit`
  })
  // MESSAGE: (id: string) => ({
  //   CREATE: `message-${id}:create`,
  //   EDIT: `message-${id}:edit`
  // })
}
