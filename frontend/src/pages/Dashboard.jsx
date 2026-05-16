import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { SkeletonLoader, SkeletonGrid } from '../components/ui/SkeletonLoader'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/analytics/dashboard`)
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <SkeletonGrid count={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4" />

  if (error)
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardBody>
          <p className="text-red-800 dark:text-red-200">Error loading dashboard: {error}</p>
        </CardBody>
      </Card>
    )

  const cards = [
    { label: 'Total Plans', value: stats?.totalPlans || 0, color: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'This Month', value: stats?.thisMonth || 0, color: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Scheduled', value: stats?.scheduled || 0, color: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'AI Assisted', value: stats?.aiAssisted || 0, color: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400">Welcome to your Lesson Plan Manager</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className={card.color}>
            <CardBody>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{card.label}</div>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardBody>
          {stats?.recentPlans && stats.recentPlans.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <div>
                    <p className="font-medium">{plan.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{plan.discipline}</p>
                  </div>
                  <Badge variant="default">{new Date(plan.createdAt).toLocaleDateString()}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No recent plans yet</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
