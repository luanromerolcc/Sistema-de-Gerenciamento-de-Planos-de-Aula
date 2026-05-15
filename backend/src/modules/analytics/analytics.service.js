import { prisma } from '../../config/prisma.js'

export async function getSummary() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [totalPlans, plansThisMonth, upcomingPlans, byDisciplineRaw, recentAudit] = await Promise.all([
    prisma.lessonPlan.count(),
    prisma.lessonPlan.count({
      where: { scheduledAt: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.lessonPlan.findMany({
      where: { scheduledAt: { gte: now, lte: weekFromNow } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      select: { id: true, title: true, discipline: true, scheduledAt: true },
    }),
    prisma.lessonPlan.groupBy({
      by: ['discipline'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { lessonPlan: { select: { title: true } } },
    }),
  ])

  const byDiscipline = byDisciplineRaw.map((row) => ({
    discipline: row.discipline,
    count: row._count.id,
  }))

  return {
    totalPlans,
    plansThisMonth,
    upcomingPlans,
    byDiscipline,
    recentAudit,
  }
}
