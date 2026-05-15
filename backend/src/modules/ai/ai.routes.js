import { recommend, recommendStream } from './ai.controller.js'
import { env } from '../../config/env.js'

export async function aiRoutes(fastify) {
  fastify.post('/recommend', {
    config: {
      rateLimit: {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
      },
    },
    handler: recommend,
  })

  // SSE endpoint — GET with query params
  fastify.get('/recommend/stream', {
    config: {
      rateLimit: {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
      },
    },
    handler: recommendStream,
  })
}
