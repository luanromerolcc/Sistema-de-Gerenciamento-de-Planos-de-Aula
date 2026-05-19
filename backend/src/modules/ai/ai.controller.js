import { getRecommendation, streamRecommendation } from './ai.service.js'
import { aiRecommendSchema } from '../lessonPlans/lessonPlan.schema.js'
import { logger } from '../../config/logger.js'

export async function recommend(request, reply) {
  try {
    const data = aiRecommendSchema.parse(request.body)
    const result = await getRecommendation(data)
    return reply.send(result)
  } catch (error) {
    logger.error({ error, body: request.body }, 'AI Recommendation error')
    throw error
  }
}

export async function recommendStream(request, reply) {
  try {
    const data = aiRecommendSchema.parse(request.query)

    reply.raw.socket?.setTimeout(30000) // abort if Groq stalls for 30s
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })

    const sendEvent = (event, payload) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
    }

    await streamRecommendation(
      data,
      (token) => {
        // Optional: can emit token events for progress indication
        // sendEvent('progress', { token })
      },
      (result) => {
        // Send the PARSED result (contents, resources, tags)
        sendEvent('done', result)
      },
    )
  } catch (err) {
    logger.error({ error: err, query: request.query }, 'AI Stream error')
    reply.raw.write(`event: error\ndata: ${JSON.stringify({ message: err.message ?? 'Erro na IA' })}\n\n`)
  } finally {
    reply.raw.end()
  }
}
