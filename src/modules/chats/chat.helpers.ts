import { isUUID } from 'class-validator'

export const isUserId = (id: string) => id.startsWith('u_') && isUUID(id.split('u_')[1])
