import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  GROQ_API_KEY: z.string().min(10),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AI_CACHE_TTL_SECONDS: z.coerce.number().default(86400),
  RATE_LIMIT_MAX: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  ALLOWED_ORIGINS: z.string().optional(), // comma-separated, e.g. "https://app.com,https://admin.app.com"
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    })
    process.exit(1)
  }
  return result.data
}

export const env = validateEnv()
