import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLessonPlans, useDeleteLessonPlan, useDuplicateLessonPlan } from '../hooks/useLessonPlans'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'

export default function LessonPlansPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: '', discipline: '', page: 1, limit: 10 })
  const [selectedPlan, setSelectedPlan] = useState(null)

  const { data: plansData, isLoading, error } = useLessonPlans(filters)
  const deleteMutation = useDeleteLessonPlan()
  const duplicateMutation = useDuplicateLessonPlan()

  const plans = plansData?.data || []
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Lesson Plans</h2>
        <Button onClick={() => navigate('/create')}>+ Create New</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search plans..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
            <Input
              placeholder="Filter by discipline..."
              value={filters.discipline}
              onChange={(e) => setFilters({ ...filters, discipline: e.target.value, page: 1 })}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setFilters({ search: '', discipline: '', page: 1, limit: 10 })}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      {isLoading ? (
        <SkeletonLoader count={5} height="h-20" />
      ) : error ? (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardBody>
            <p className="text-red-800 dark:text-red-200">Error loading plans</p>
          </CardBody>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No lesson plans found</p>
            <Button onClick={() => navigate('/create')}>Create Your First Plan</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedPlan(plan.id)}>
              <CardBody className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{plan.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{plan.discipline}</p>
                  <div className="flex gap-2 flex-wrap">
                    {plan.tags?.map((tag) => (
                      <Badge key={tag} variant="neutral" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${plan.id}`); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleDuplicate(plan.id); }}>
                    Duplicate
                  </Button>
                  <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > filters.limit && (
        <Card>
          <CardBody className="flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {filters.page} of {Math.ceil(total / filters.limit)}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={filters.page >= Math.ceil(total / filters.limit)}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
