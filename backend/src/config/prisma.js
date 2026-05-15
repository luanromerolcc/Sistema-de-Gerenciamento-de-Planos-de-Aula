import { PrismaClient } from '@prisma/client'
import { logger } from '../config/logger.js'

const globalForPrisma = global

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  })

prisma.$on('error', (e) => logger.error({ msg: e.message }, 'Prisma error'))
prisma.$on('warn', (e) => logger.warn({ msg: e.message }, 'Prisma warn'))

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
