import { GoogleGenerativeAI } from '@google/generative-ai'
import { createHash } from 'crypto'
import { getRedis } from '../../config/redis.js'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../../config/prisma.js'

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

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
  } catch {
    // Audit log failure is non-critical
  }
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
  } catch {
    // Redis unavailable, continue without cache
  }

  const start = Date.now()
  const response = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt({ title, discipline, summary })}` }],
    }],
  })

  const latency = `${((Date.now() - start) / 1000).toFixed(1)}s`
  const tokenUsage = response.usageMetadata?.promptTokens + response.usageMetadata?.candidatesTokens

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
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
  } catch {
    // Redis caching failed, result still returned
  }

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
  } catch {
    // Redis unavailable, continue with live stream
  }

  const start = Date.now()
  const stream = await model.generateContentStream({
    contents: [{
      role: 'user',
      parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt({ title, discipline, summary })}` }],
    }],
  })

  let fullText = ''
  for await (const chunk of stream.stream) {
    const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text
    if (chunkText) {
      fullText += chunkText
      onToken(chunkText)
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
  } catch {
    // Cache write failed, response already streamed
  }

  onDone({ cached: false })
}
