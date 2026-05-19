import { prisma } from '../../config/prisma.js'

export async function getSummary() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [totalPlans, plansThisMonth, upcomingPlans, byDisciplineRaw, aiAssistedCount, recentPlansRaw] = await Promise.all([
      prisma.lessonPlan.count().catch(() => 0),
      prisma.lessonPlan.count({
        where: { scheduledAt: { gte: startOfMonth, lte: endOfMonth } },
      }).catch(() => 0),
      prisma.lessonPlan.count({
        where: { scheduledAt: { gte: now, lte: weekFromNow } },
      }).catch(() => 0),
      prisma.lessonPlan.groupBy({
        by: ['discipline'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }).catch(() => []),
      prisma.auditLog.findMany({
        where: { action: 'AI_ASSIST' },
        distinct: ['lessonPlanId'],
        select: { lessonPlanId: true },
      }).catch(() => []),
      prisma.lessonPlan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, discipline: true, createdAt: true },
      }).catch(() => []),
    ])

    const byDiscipline = byDisciplineRaw.map((row) => ({
      name: row.discipline,
      count: row._count.id,
    }))

    return {
      totalPlans,
      thisMonth: plansThisMonth,
      scheduled: upcomingPlans,
      aiAssisted: new Set(aiAssistedCount.map(log => log.lessonPlanId)).size,
      byDiscipline,
      recentPlans: recentPlansRaw,
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return {
      totalPlans: 0,
      thisMonth: 0,
      scheduled: 0,
      aiAssisted: 0,
      byDiscipline: [],
      recentPlans: [],
    }
  }
}
