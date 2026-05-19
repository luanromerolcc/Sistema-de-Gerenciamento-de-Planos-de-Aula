import { logger } from '../config/logger.js'
import { ZodError } from 'zod'

export function errorHandler(error, request, reply) {
  // Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
    logger.warn(
      { url: request.url, method: request.method, issues, body: request.body },
      'Validation Error'
    )
    return reply.code(400).send({
      statusCode: 400,
      error: 'Validation Error',
      issues,
    })
  }

  // Custom business errors
  if (error.statusCode) {
    logger.warn({ url: request.url, method: request.method, message: error.message }, 'Business Error')
    return reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.message,
    })
  }

  // Fastify validation (schema) errors
  if (error.validation) {
    logger.warn(
      { url: request.url, method: request.method, validation: error.validation },
      'Schema Validation Error'
    )
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    })
  }

  // Unexpected errors
  logger.error({ err: error, url: request.url, method: request.method }, 'Unhandled error')
  return reply.code(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
  })
}
