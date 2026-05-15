import Redis from 'ioredis'
import { env } from './env.js'
import { logger } from './logger.js'

let redisClient = null

export function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 100, 3000)
      },
    })

    redisClient.on('connect', () => logger.info('Redis connected'))
    redisClient.on('error', (err) => logger.error({ err }, 'Redis error'))
  }
  return redisClient
}

export async function connectRedis() {
  try {
    await getRedis().connect()
  } catch (err) {
    logger.warn({ err }, 'Redis unavailable — caching disabled')
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
