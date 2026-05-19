import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FileText, CalendarDays, Clock, Sparkles } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import DisciplineChart from '../components/DisciplineChart'
import { api } from '../services/api'

const ACCENT_COLORS = {
  total:     { bg: 'from-pink-500 to-pink-600',    icon: 'text-pink-600' },
  month:     { bg: 'from-rose-500 to-rose-600',    icon: 'text-rose-600' },
  scheduled: { bg: 'from-purple-500 to-purple-600', icon: 'text-purple-600' },
  ai:        { bg: 'from-violet-500 to-violet-600', icon: 'text-violet-600' },
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
        setError(err.message || 'Falha ao carregar o painel')
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
          <p className="text-red-800 dark:text-red-200">Erro ao carregar o painel: {error}</p>
        </CardBody>
      </Card>
    )

  const hasPlans = stats?.totalPlans > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Painel</h1>
        <Button
          onClick={() => navigate('/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          + Novo Plano
        </Button>
      </div>

      {hasPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total de Planos"
            value={stats?.totalPlans ?? 0}
            icon={<FileText size={18} />}
            accent={ACCENT_COLORS.total}
            onView={() => navigate('/plans')}
          />
          <StatCard
            label="Este Mês"
            value={stats?.thisMonth ?? 0}
            icon={<CalendarDays size={18} />}
            accent={ACCENT_COLORS.month}
            onView={() => navigate('/plans')}
          />
          <StatCard
            label="Agendados"
            value={stats?.scheduled ?? 0}
            icon={<Clock size={18} />}
            accent={ACCENT_COLORS.scheduled}
            onView={() => navigate('/plans')}
          />

          <StatCard
            label="Com Assistência de IA"
            value={stats?.aiAssisted ?? 0}
            icon={<Sparkles size={18} />}
            accent={ACCENT_COLORS.ai}
            onView={() => navigate('/plans')}
          />
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 uppercase tracking-wide">
              Planos por Disciplina
            </p>
            <DisciplineChart data={stats?.byDiscipline ?? []} />
          </div>

          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Atividade Recente</p>
              <button
                onClick={() => navigate('/plans')}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Ver todos →
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
                      {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                Nenhum plano recente
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-16">
          <EmptyState
            title="Comece criando planos de aula"
            description="Crie seu primeiro plano de aula e mantenha suas aulas organizadas."
            primaryAction={{ label: 'Criar com IA', onClick: () => navigate('/create?ai=1') }}
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, onView }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <button
          onClick={onView}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Ver
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-[28px] font-semibold text-slate-900 dark:text-slate-50 leading-none">{value}</p>
    </div>
  )
}
