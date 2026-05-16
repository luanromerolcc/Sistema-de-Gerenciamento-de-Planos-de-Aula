import { recommend, recommendStream } from './ai.controller.js'
import { env } from '../../config/env.js'
import { aiSchema } from './ai.schema.js'

export async function aiRoutes(fastify) {
  fastify.post('/recommend', {
    schema: aiSchema.recommend,
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
    schema: aiSchema.recommendStream,
    config: {
      rateLimit: {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
      },
    },
    handler: recommendStream,
  })
}
