import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FileText, CalendarDays, Clock, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SkeletonLoader, SkeletonGrid } from '../components/ui/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import DisciplineChart from '../components/DisciplineChart'
import { api } from '../services/api'

const ACCENT_COLORS = {
  total: { 
    bg: 'from-pink-500 to-pink-600', 
    light: 'from-pink-50 to-pink-100', 
    icon: 'text-pink-600' 
  },
  month: { 
    bg: 'from-rose-500 to-rose-600', 
    light: 'from-rose-50 to-rose-100', 
    icon: 'text-rose-600' 
  },
  scheduled: { 
    bg: 'from-purple-500 to-purple-600', 
    light: 'from-purple-50 to-purple-100', 
    icon: 'text-purple-600' 
  },
  ai: { 
    bg: 'from-violet-500 to-violet-600', 
    light: 'from-violet-50 to-violet-100', 
    icon: 'text-violet-600' 
  },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.analytics.getDashboard()
        setStats(data)
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(err.message || 'Failed to load dashboard')
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

  const hasPlans = stats?.totalPlans > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Welcome back</h1>
        <Button
          onClick={() => navigate('/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          + Create New Plan
        </Button>
      </div>

      {hasPlans ? (
        <>
          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Row 1 — 3 stat cards */}
            <StatCard
              label="Total Plans"
              value={stats?.totalPlans ?? 0}
              icon={<FileText size={18} />}
              accent={ACCENT_COLORS.total}
              onView={() => navigate('/plans')}
            />
            <StatCard
              label="This Month"
              value={stats?.thisMonth ?? 0}
              icon={<CalendarDays size={18} />}
              accent={ACCENT_COLORS.month}
              onView={() => navigate('/plans')}
            />
            <StatCard
              label="Scheduled"
              value={stats?.scheduled ?? 0}
              icon={<Clock size={18} />}
              accent={ACCENT_COLORS.scheduled}
              onView={() => navigate('/plans')}
            />

            {/* Row 2 — AI stat + chart */}
            <StatCard
              label="AI Assisted"
              value={stats?.aiAssisted ?? 0}
              icon={<Sparkles size={18} />}
              accent={ACCENT_COLORS.ai}
              onView={() => navigate('/plans')}
            />
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 uppercase tracking-wide">
                Plans by Discipline
              </p>
              <DisciplineChart data={stats?.byDiscipline ?? []} />
            </div>

            {/* Row 3 — recent activity */}
            <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent Activity</p>
                <button
                  onClick={() => navigate('/plans')}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  View all →
                </button>
              </div>
              {stats?.recentPlans?.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => navigate(`/edit/${plan.id}`)}
                      className="w-full text-left flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{plan.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.discipline}</p>
                      </div>
                      <Badge variant="default">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No recent plans</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-16">
          <EmptyState
            title="Start creating lesson plans"
            description="Create your first lesson plan and keep your classes organized."
            primaryAction={{ label: 'Create with AI', onClick: () => navigate('/create?ai=1') }}
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, accent, onView }) {
  return (
    <div
      style={{ borderLeft: `3px solid ${accent}` }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <button
          onClick={onView}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          View
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-[28px] font-semibold text-slate-900 dark:text-slate-50 leading-none">{value}</p>
    </div>
  )
}
