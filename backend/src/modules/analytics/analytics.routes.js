import { getSummary } from './analytics.service.js'

export async function analyticsRoutes(fastify) {
  fastify.get('/summary', async (request, reply) => {
    const data = await getSummary()
    return reply.send(data)
  })
}
