import { buildApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { prisma } from './config/prisma.js'

async function main() {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    logger.info(`🚀 Server running at http://0.0.0.0:${env.PORT}`)
    logger.info(`📚 API Docs at http://0.0.0.0:${env.PORT}/api/docs`)
  } catch (err) {
    logger.error({ err }, 'Failed to start server')
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

main()
