import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useLessonPlans, useDeleteLessonPlan, useDuplicateLessonPlan } from '../hooks/useLessonPlans'
import { useFilterStore } from '../store/filterStore'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'

export default function LessonPlansPage() {
  const navigate = useNavigate()
  const { filters, setFilter, setFilters, resetFilters } = useFilterStore()

  const { data: plansData, isLoading, error } = useLessonPlans(filters)
  const deleteMutation = useDeleteLessonPlan()
  const duplicateMutation = useDuplicateLessonPlan()

  const plans = plansData?.plans || []
  const total = plansData?.total || 0

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this lesson plan?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleDuplicate = async (id) => {
    await duplicateMutation.mutateAsync(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Lesson Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and organize all your lesson plans</p>
        </div>
        <Button onClick={() => navigate('/create')} className="self-start sm:self-center">
          + Create New Plan
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search lesson plans..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Filter by discipline..."
              value={filters.discipline}
              onChange={(e) => setFilters({ discipline: e.target.value, page: 1 })}
            />
            {(filters.search || filters.discipline) && (
              <div className="md:col-span-3">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Plans List */}
      {isLoading ? (
        <SkeletonLoader count={5} height="h-24" />
      ) : error ? (
        <Card className="border-red-200 dark:border-red-800">
          <CardBody>
            <p className="text-sm text-red-700 dark:text-red-300">Error loading plans: {error.message}</p>
          </CardBody>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardBody className="py-6">
            <EmptyState
              title={filters.search || filters.discipline ? 'No plans found' : 'No lesson plans yet'}
              description={
                filters.search || filters.discipline
                  ? 'Try adjusting your search filters'
                  : 'Get started by creating your first lesson plan'
              }
              actionLabel="Create New Plan"
              onAction={() => navigate('/create')}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              onClick={() => navigate(`/edit/${plan.id}`)}
            >
              <CardBody className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate mb-0.5">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{plan.discipline}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="neutral" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {plan.tags?.length > 3 && (
                        <Badge variant="neutral" className="text-xs">
                          +{plan.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/edit/${plan.id}`)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDuplicate(plan.id)}>
                      Copy
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(plan.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > filters.pageSize && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilter('page', filters.page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400 px-3">
            Page {filters.page} of {Math.ceil(total / filters.pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page >= Math.ceil(total / filters.pageSize)}
            onClick={() => setFilter('page', filters.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
