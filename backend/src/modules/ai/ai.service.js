import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'
import { getRedis } from '../../config/redis.js'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../../config/prisma.js'

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um Assistente Pedagógico especializado em planejamento de aulas.
Responda APENAS em JSON válido, sem texto adicional, sem blocos de código markdown.`

function buildUserPrompt({ title, discipline, summary }) {
  return `Com base nas informações abaixo, sugira conteúdos complementares para esta aula:
Título: ${title}
Disciplina: ${discipline}
Ementa: ${summary}

Retorne um JSON com exatamente este formato:
{
  "contents": "Lista detalhada de conteúdos e subtópicos sugeridos...",
  "resources": "Recursos de apoio recomendados (livros, links, ferramentas)...",
  "tags": ["tag1", "tag2", "tag3"]
}`
}

function cacheKey({ title, discipline, summary }) {
  const hash = createHash('md5').update(`${title}||${discipline}||${summary}`).digest('hex')
  return `ai:recommend:${hash}`
}

async function logAI(lessonPlanId, metadata) {
  try {
    await prisma.auditLog.create({ data: { action: 'AI_ASSIST', lessonPlanId, metadata } })
  } catch {}
}

export async function getRecommendation({ title, discipline, summary, lessonPlanId }) {
  const key = cacheKey({ title, discipline, summary })
  const redis = getRedis()

  // Try cache
  try {
    const cached = await redis.get(key)
    if (cached) {
      logger.info({ title, discipline, cached: true }, 'AI Request (cache hit)')
      return { ...JSON.parse(cached), cached: true }
    }
  } catch {}

  const start = Date.now()
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt({ title, discipline, summary }) }],
  })

  const latency = `${((Date.now() - start) / 1000).toFixed(1)}s`
  const tokenUsage = message.usage?.input_tokens + message.usage?.output_tokens

  const raw = message.content[0]?.text ?? '{}'
  const clean = raw.replace(/```json|```/g, '').trim()

  let result
  try {
    result = JSON.parse(clean)
  } catch {
    throw { statusCode: 502, message: 'IA retornou resposta inválida' }
  }

  logger.info({ title, discipline, cached: false, tokenUsage, latency }, 'AI Request')
  await logAI(lessonPlanId, { title, discipline, tokenUsage, latency })

  // Store in cache
  try {
    await redis.set(key, JSON.stringify(result), 'EX', env.AI_CACHE_TTL_SECONDS)
  } catch {}

  return { ...result, cached: false }
}

export async function streamRecommendation({ title, discipline, summary, lessonPlanId }, onToken, onDone) {
  const key = cacheKey({ title, discipline, summary })
  const redis = getRedis()

  // Check cache first
  try {
    const cached = await redis.get(key)
    if (cached) {
      logger.info({ title, discipline, cached: true }, 'AI Stream (cache hit)')
      const parsed = JSON.parse(cached)
      onToken(JSON.stringify(parsed))
      onDone({ cached: true })
      return
    }
  } catch {}

  const start = Date.now()
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt({ title, discipline, summary }) }],
  })

  let fullText = ''
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      const token = chunk.delta.text
      fullText += token
      onToken(token)
    }
  }

  const latency = `${((Date.now() - start) / 1000).toFixed(1)}s`
  logger.info({ title, discipline, cached: false, latency }, 'AI Stream complete')
  await logAI(lessonPlanId, { title, discipline, latency, streamed: true })

  // Cache the full response
  try {
    const clean = fullText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    await redis.set(key, JSON.stringify(parsed), 'EX', env.AI_CACHE_TTL_SECONDS)
  } catch {}

  onDone({ cached: false })
}
