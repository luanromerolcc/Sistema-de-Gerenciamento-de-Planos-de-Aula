import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { connectRedis } from './config/redis.js'
import { prisma } from './config/prisma.js'
import { errorHandler } from './middleware/errorHandler.js'
import { lessonPlanRoutes } from './modules/lessonPlans/lessonPlan.routes.js'
import { aiRoutes } from './modules/ai/ai.routes.js'
import { analyticsRoutes } from './modules/analytics/analytics.routes.js'

export async function buildApp() {
  const fastify = Fastify({
    logger,
    trustProxy: true,
  })

  // Plugins
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : true // open for dev/evaluation; set ALLOWED_ORIGINS in production
  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  })

  await fastify.register(rateLimit, {
    global: false, // per-route opt-in
    redis: null, // in-memory for global; AI routes use own config
  })

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Lesson Plan Manager API',
        description: 'API para gerenciamento de planos de aula com assistência de IA',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      tags: [
        { name: 'lesson-plans', description: 'CRUD de planos de aula' },
        { name: 'ai', description: 'Smart Assist com IA' },
        { name: 'analytics', description: 'Dashboard e métricas' },
      ],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  })

  // Error handler
  fastify.setErrorHandler(errorHandler)

  // Health check
  fastify.get('/health', async () => {
    let dbStatus = 'ok'
    let redisStatus = 'ok'

    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      dbStatus = 'error'
    }

    try {
      const { getRedis } = await import('./config/redis.js')
      await getRedis().ping()
    } catch {
      redisStatus = 'unavailable'
    }

    return {
      status: 'ok',
      db: dbStatus,
      redis: redisStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  })

  // Routes
  await fastify.register(lessonPlanRoutes, { prefix: '/api/lesson-plans' })
  await fastify.register(aiRoutes, { prefix: '/api/ai' })
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' })

  // Connect Redis (non-blocking)
  await connectRedis()

  await fastify.ready()
  return fastify
}
