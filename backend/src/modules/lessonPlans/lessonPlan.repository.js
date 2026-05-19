import { prisma } from '../../config/prisma.js'
import { Prisma } from '@prisma/client'

export async function findAll({
  discipline,
  tags,
  scheduledFrom,
  scheduledTo,
  search,
  sortBy,
  sortOrder,
  page,
  pageSize,
}) {
  const where = {}

  if (discipline) where.discipline = { contains: discipline, mode: 'insensitive' }
  if (tags?.length) where.tags = { hasSome: tags }
  if (scheduledFrom || scheduledTo) {
    where.scheduledAt = {}
    if (scheduledFrom) where.scheduledAt.gte = new Date(scheduledFrom)
    if (scheduledTo) where.scheduledAt.lte = new Date(scheduledTo)
  }

  // Full-text search via raw SQL
  let searchFilter = ''
  if (search) {
    searchFilter = search
      .split(' ')
      .filter(Boolean)
      .map((w) => `${w}:*`)
      .join(' & ')
  }

  const skip = (page - 1) * pageSize

  // Use raw for full-text; otherwise use standard Prisma query
  if (search && searchFilter) {
    const disciplineClause = discipline
      ? Prisma.sql`AND discipline ILIKE ${'%' + discipline + '%'}`
      : Prisma.empty

    const [plans, countResult] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, title, objective, summary, "scheduledAt", discipline, contents, resources, tags, "createdAt", "updatedAt"
        FROM "LessonPlan"
        WHERE "searchVector" @@ to_tsquery('portuguese', ${searchFilter})
        ${disciplineClause}
        ORDER BY ts_rank("searchVector", to_tsquery('portuguese', ${searchFilter})) DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `,
      prisma.$queryRaw`
        SELECT COUNT(*)::int as count FROM "LessonPlan"
        WHERE "searchVector" @@ to_tsquery('portuguese', ${searchFilter})
      `,
    ])
    return { plans, total: countResult[0]?.count ?? 0, page, pageSize }
  }

  const [plans, total] = await Promise.all([
    prisma.lessonPlan.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        objective: true,
        scheduledAt: true,
        discipline: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.lessonPlan.count({ where }),
  ])

  return { plans, total, page, pageSize }
}

export async function findById(id) {
  return prisma.lessonPlan.findUnique({ where: { id } })
}

export async function create(data) {
  return prisma.lessonPlan.create({
    data: {
      ...data,
      scheduledAt: new Date(data.scheduledAt),
    },
  })
}

export async function update(id, data) {
  const current = await findById(id)
  if (!current) return null

  // Save version snapshot before update
  await prisma.lessonPlanVersion.create({
    data: {
      lessonPlanId: id,
      snapshot: current,
    },
  })

  return prisma.lessonPlan.update({
    where: { id },
    data: {
      ...data,
      ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
    },
  })
}

export async function remove(id) {
  return prisma.lessonPlan.delete({ where: { id } })
}

export async function findVersions(lessonPlanId) {
  return prisma.lessonPlanVersion.findMany({
    where: { lessonPlanId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findVersion(lessonPlanId, versionId) {
  return prisma.lessonPlanVersion.findFirst({
    where: { id: versionId, lessonPlanId },
  })
}

export async function restoreVersion(id, versionId) {
  const version = await findVersion(id, versionId)
  if (!version) return null

  // eslint-disable-next-line no-unused-vars
  const { id: _id, createdAt: _ca, updatedAt: _ua, ...snapshot } = version.snapshot

  const current = await findById(id)
  await prisma.lessonPlanVersion.create({
    data: { lessonPlanId: id, snapshot: current },
  })

  return prisma.lessonPlan.update({
    where: { id },
    data: snapshot,
  })
}
export async function duplicate(id) {
  const plan = await findById(id)
  if (!plan) return null

  // eslint-disable-next-line no-unused-vars
  const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = plan

  return prisma.lessonPlan.create({
    data: {
      ...rest,
      title: `[Cópia] ${rest.title}`,
    },
  })
}