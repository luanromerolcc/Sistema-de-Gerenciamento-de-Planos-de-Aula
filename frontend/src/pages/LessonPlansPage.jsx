import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Edit2, Copy, Trash2, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { useLessonPlans, useDeleteLessonPlan, useDuplicateLessonPlan } from '../hooks/useLessonPlans'

const ITEMS_PER_PAGE = 6

export default function LessonPlansPage() {
  const navigate = useNavigate()
  const { data, isLoading: loading, error } = useLessonPlans()
  const deleteMutation = useDeleteLessonPlan()
  const duplicateMutation = useDuplicateLessonPlan()

  // Handle both array and paginated response formats
  const lessonPlans = Array.isArray(data) ? data : (data?.plans || data?.data || [])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDiscipline, setSelectedDiscipline] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Get unique disciplines
  const disciplines = useMemo(() => {
    const unique = new Set(lessonPlans.map(plan => plan.discipline || 'Uncategorized'))
    return Array.from(unique).sort()
  }, [lessonPlans])

  // Filter and sort lessons
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = lessonPlans.filter(plan => {
      const matchesSearch = 
        (plan.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.discipline || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.objective || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesDiscipline = selectedDiscipline === 'all' || plan.discipline === selectedDiscipline
      
      return matchesSearch && matchesDiscipline
    })

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    } else if (sortBy === 'scheduled') {
      filtered.sort((a, b) => {
        const aDate = a.scheduledAt ? new Date(a.scheduledAt) : new Date(9999, 0, 0)
        const bDate = b.scheduledAt ? new Date(b.scheduledAt) : new Date(9999, 0, 0)
        return aDate - bDate
      })
    }

    return filtered
  }, [lessonPlans, searchTerm, selectedDiscipline, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPlans.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedPlans = filteredAndSortedPlans.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  const handleFilterChange = (callback) => {
    setCurrentPage(1)
    callback()
  }

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id)
      setDeleteConfirm(null)
      // Adjust page if needed
      if (paginatedPlans.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleDuplicate = async (plan) => {
    try {
      await duplicateMutation.mutateAsync(plan.id)
      // Reset to first page to see new plan
      setCurrentPage(1)
    } catch (err) {
      console.error('Duplicate failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader count={6} height="h-32" className="space-y-4" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading lesson plans</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-50 mb-1">
            Lesson Plans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredAndSortedPlans.length} plans
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        <Button
          onClick={() => navigate('/create')}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg"
        >
          <span>+</span> Create New Plan
        </Button>
      </div>

      {/* Controls - Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <Input
            placeholder="Search plans or tags..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
            className="pl-10"
          />
        </div>

        {/* Discipline Filter */}
        <select
          value={selectedDiscipline}
          onChange={(e) => handleFilterChange(() => setSelectedDiscipline(e.target.value))}
          className="px-3.5 py-2.5 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
        >
          <option value="all">All Disciplines</option>
          {disciplines.map(discipline => (
            <option key={discipline} value={discipline}>{discipline}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => handleFilterChange(() => setSortBy(e.target.value))}
          className="px-3.5 py-2.5 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
        >
          <option value="recent">Most Recent</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="scheduled">Scheduled First</option>
        </select>
      </div>

      {/* Plans Grid */}
      {filteredAndSortedPlans.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-slideInUp">
            {paginatedPlans.map((plan, idx) => (
              <LessonPlanCard
                key={plan.id}
                plan={plan}
                index={idx}
                onEdit={() => navigate(`/edit/${plan.id}`)}
                onDuplicate={() => handleDuplicate(plan)}
                onDelete={() => setDeleteConfirm(plan.id)}
                isDeleting={deleteConfirm === plan.id}
                onConfirmDelete={() => handleDelete(plan.id)}
                onCancelDelete={() => setDeleteConfirm(null)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold">{startIdx + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(startIdx + ITEMS_PER_PAGE, filteredAndSortedPlans.length)}</span> of{' '}
                <span className="font-semibold">{filteredAndSortedPlans.length}</span> plans
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg font-medium text-sm transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Filter size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">
            No lesson plans found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {searchTerm || selectedDiscipline !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Create your first lesson plan to get started'}
          </p>
          <Button onClick={() => navigate('/create')}>Create First Plan</Button>
        </div>
      )}
    </div>
  )
}

function LessonPlanCard({
  plan,
  index,
  onEdit,
  onDuplicate,
  onDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
}) {
  const disciplineColors = {
    'DevOps': { bg: 'from-blue-500 to-blue-600', light: 'from-blue-50 to-blue-100' },
    'Mathematics': { bg: 'from-red-500 to-red-600', light: 'from-red-50 to-red-100' },
    'Science': { bg: 'from-green-500 to-green-600', light: 'from-green-50 to-green-100' },
    'Literature': { bg: 'from-purple-500 to-purple-600', light: 'from-purple-50 to-purple-100' },
    'Physics': { bg: 'from-cyan-500 to-cyan-600', light: 'from-cyan-50 to-cyan-100' },
    'Biology': { bg: 'from-emerald-500 to-emerald-600', light: 'from-emerald-50 to-emerald-100' },
    'Chemistry': { bg: 'from-amber-500 to-amber-600', light: 'from-amber-50 to-amber-100' },
    'History': { bg: 'from-orange-500 to-orange-600', light: 'from-orange-50 to-orange-100' },
  }

  const colors = disciplineColors[plan.discipline] || {
    bg: 'from-slate-500 to-slate-600',
    light: 'from-slate-50 to-slate-100',
  }

  // Pegar tags limitadas (máximo 3)
  const displayedTags = (plan.tags || []).slice(0, 3)
  const remainingTags = Math.max(0, (plan.tags || []).length - 3)

  // Formatar data agendada
  const formatScheduledDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Verificar se a aula está próxima (nos próximos 7 dias)
  const isScheduledSoon = plan.scheduledAt && 
    new Date(plan.scheduledAt) > new Date() && 
    new Date(plan.scheduledAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <div
      className="animate-slideInUp group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${colors.bg} text-white p-4 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold leading-tight flex-1 pr-2">{plan.title || 'Untitled'}</h3>
            </div>
            <Badge variant="default" className="bg-white/20 text-white border-white/30">
              {plan.discipline || 'Uncategorized'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
            {plan.objective || 'No objective provided'}
          </p>

          {/* Tags Section */}
          {displayedTags && displayedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              {displayedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
              {remainingTags > 0 && (
                <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full text-xs font-medium">
                  +{remainingTags} more
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 py-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Created</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            {plan.scheduledAt && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Calendar size={14} />
                  <span>Scheduled</span>
                </div>
                <span className={`font-medium ${
                  isScheduledSoon 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  {formatScheduledDate(plan.scheduledAt)}
                  {isScheduledSoon && ' 🔔'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex gap-2">
          {!isDeleting ? (
            <>
              <button
                onClick={onEdit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                onClick={onDuplicate}
                className="inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Duplicate"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onConfirmDelete}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Confirm Delete
              </button>
              <button
                onClick={onCancelDelete}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}