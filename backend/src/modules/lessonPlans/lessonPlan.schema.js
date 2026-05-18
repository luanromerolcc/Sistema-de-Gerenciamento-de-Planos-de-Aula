import { z } from 'zod'

export const createLessonPlanSchema = z.object({
  title: z.string().min(3).max(200),
  objective: z.string().max(500).optional().or(z.literal('')),
  summary: z.string().min(10),
  scheduledAt: z.string().datetime().optional().nullable(),
  discipline: z.string().min(2).max(100),
  contents: z.string().min(10),
  resources: z.string().default(''),
  tags: z.array(z.string().max(50)).max(20).default([]),
})

export const updateLessonPlanSchema = createLessonPlanSchema.partial()

export const listQuerySchema = z.object({
  discipline: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  scheduledFrom: z.string().datetime().optional(),
  scheduledTo: z.string().datetime().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['scheduledAt', 'createdAt', 'title', 'discipline']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const aiRecommendSchema = z.object({
  title: z.string().min(3).max(200),
  discipline: z.string().min(2).max(100),
  summary: z.string().min(10),
  lessonPlanId: z.string().optional(),
})

export const idParamSchema = z.object({
  id: z.string().cuid(),
})

export const restoreParamSchema = z.object({
  id: z.string().cuid(),
  vid: z.string().cuid(),
})

export const lessonPlanSchema = {
  list: {
    querystring: {
      type: 'object',
      properties: {
        discipline: { type: 'string' },
        search: { type: 'string' },
        page: { type: 'integer' },
        pageSize: { type: 'integer' },
      },
    },
  },
  create: {
    body: {
      type: 'object',
      required: ['title', 'summary', 'discipline', 'contents'],
      properties: {
        title: { type: 'string' },
        objective: { type: 'string' },
        summary: { type: 'string' },
        scheduledAt: { type: ['string', 'null'] },
        discipline: { type: 'string' },
        contents: { type: 'string' },
        resources: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  },
  get: {
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
    },
  },
  update: {
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
    },
    body: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        objective: { type: 'string' },
        summary: { type: 'string' },
        scheduledAt: { type: 'string' },
        discipline: { type: 'string' },
        contents: { type: 'string' },
        resources: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  },
  delete: {
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
    },
  },
}