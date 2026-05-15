import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(10),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AI_CACHE_TTL_SECONDS: z.coerce.number().default(86400),
  RATE_LIMIT_MAX: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
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
