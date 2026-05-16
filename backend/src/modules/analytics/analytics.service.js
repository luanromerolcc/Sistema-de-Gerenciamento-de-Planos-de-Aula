import { prisma } from '../../config/prisma.js'

export async function getSummary() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [totalPlans, plansThisMonth, upcomingPlans, byDisciplineRaw] = await Promise.all([
      prisma.lessonPlan.count().catch(() => 0),
      prisma.lessonPlan.count({
        where: { scheduledAt: { gte: startOfMonth, lte: endOfMonth } },
      }).catch(() => 0),
      prisma.lessonPlan.findMany({
        where: { scheduledAt: { gte: now, lte: weekFromNow } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        select: { id: true, title: true, discipline: true, scheduledAt: true },
      }).catch(() => []),
      prisma.lessonPlan.groupBy({
        by: ['discipline'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }).catch(() => []),
    ])

    const byDiscipline = byDisciplineRaw.map((row) => ({
      discipline: row.discipline,
      count: row._count.id,
    }))

    return {
      totalPlans,
      thisMonth: plansThisMonth,
      scheduled: upcomingPlans.length,
      aiAssisted: 0,
      byDiscipline,
      recentPlans: upcomingPlans,
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
