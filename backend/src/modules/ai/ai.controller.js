import { getRecommendation, streamRecommendation } from './ai.service.js'
import { aiRecommendSchema } from '../lessonPlans/lessonPlan.schema.js'

export async function recommend(request, reply) {
  const data = aiRecommendSchema.parse(request.body)
  const result = await getRecommendation(data)
  return reply.send(result)
}

export async function recommendStream(request, reply) {
  const data = aiRecommendSchema.parse(request.query)

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  const sendEvent = (event, payload) => {
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
  }

  try {
    await streamRecommendation(
      data,
      (token) => sendEvent('token', { token }),
      (meta) => sendEvent('done', meta),
    )
  } catch (err) {
    sendEvent('error', { message: err.message ?? 'Erro na IA' })
  } finally {
    reply.raw.end()
  }
}
