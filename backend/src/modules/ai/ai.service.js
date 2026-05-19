import Groq from 'groq-sdk'
import { createHash } from 'crypto'
import { getRedis } from '../../config/redis.js'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../../config/prisma.js'

const groq = new Groq({ apiKey: env.GROQ_API_KEY })

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
  } catch (error) {
    logger.debug({ error }, 'Audit log write failed')
  }
}

export async function getRecommendation({ title, discipline, summary, lessonPlanId }) {
  const key = cacheKey({ title, discipline, summary })
  const redis = getRedis()

  try {
    const cached = await redis.get(key)
    if (cached) {
      logger.info({ title, discipline, cached: true }, 'AI Request (cache hit)')
      return { ...JSON.parse(cached), cached: true }
    }
  } catch (error) {
    logger.debug({ error }, 'Redis cache read failed')
  }

  const start = Date.now()
  const response = await groq.chat.completions.create({
    model: env.GROQ_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt({ title, discipline, summary }) },
    ],
    response_format: { type: 'json_object' },
  })

  const latency = `${((Date.now() - start) / 1000).toFixed(1)}s`
  const tokenUsage = (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0)
  const raw = response.choices?.[0]?.message?.content ?? '{}'

  let result
  try {
    result = JSON.parse(raw)
  } catch (error) {
    logger.error({ error }, 'Failed to parse AI response')
    throw { statusCode: 502, message: 'IA retornou resposta inválida' }
  }

  logger.info({ title, discipline, cached: false, tokenUsage, latency }, 'AI Request')
  await logAI(lessonPlanId, { title, discipline, tokenUsage, latency })

  try {
    await redis.set(key, JSON.stringify(result), 'EX', env.AI_CACHE_TTL_SECONDS)
  } catch (error) {
    logger.debug({ error }, 'Redis cache write failed')
  }

  return { ...result, cached: false }
}

export async function streamRecommendation({ title, discipline, summary, lessonPlanId }, onToken, onDone) {
  const key = cacheKey({ title, discipline, summary })
  const redis = getRedis()

  try {
    const cached = await redis.get(key)
    if (cached) {
      logger.info({ title, discipline, cached: true }, 'AI Stream (cache hit)')
      const parsed = JSON.parse(cached)
      onDone({ ...parsed, cached: true })
      return
    }
  } catch (error) {
    logger.debug({ error }, 'Redis cache read failed')
  }

  const start = Date.now()
  const stream = await groq.chat.completions.create({
    model: env.GROQ_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt({ title, discipline, summary }) },
    ],
    stream: true,
  })

  let fullText = ''
  for await (const chunk of stream) {
    const chunkText = chunk.choices?.[0]?.delta?.content
    if (chunkText) {
      fullText += chunkText
      // Don't emit raw tokens to UI - tokens will be accumulated and parsed
    }
  }

  const latency = `${((Date.now() - start) / 1000).toFixed(1)}s`
  
  let parsed
  try {
    const clean = fullText.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(clean)
  } catch (error) {
    logger.error({ error, fullText }, 'Failed to parse AI stream response')
    throw { statusCode: 502, message: 'IA retornou resposta inválida' }
  }

  logger.info({ title, discipline, cached: false, latency }, 'AI Stream complete')
  await logAI(lessonPlanId, { title, discipline, latency, streamed: true })

  try {
    await redis.set(key, JSON.stringify(parsed), 'EX', env.AI_CACHE_TTL_SECONDS)
  } catch (error) {
    logger.debug({ error }, 'Redis cache write failed')
  }

  // Send the PARSED result in the done event, not raw tokens
  onDone({ ...parsed, cached: false })
}
