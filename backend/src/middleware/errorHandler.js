import { logger } from '../config/logger.js'
import { ZodError } from 'zod'

export function errorHandler(error, request, reply) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Validation Error',
      issues: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    })
  }

  // Custom business errors
  if (error.statusCode) {
    return reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.message,
    })
  }

  // Fastify validation (schema) errors
  if (error.validation) {
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
