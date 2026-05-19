import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLessonPlan, useCreateLessonPlan, useUpdateLessonPlan } from '../hooks/useLessonPlans'
import { Card, CardBody, CardHeader, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import SmartAssistPanel from '../components/SmartAssistPanel'

const TEXTAREA_BASE = 'w-full px-3.5 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm resize-none'
const TEXTAREA_NORMAL = 'border-slate-300 dark:border-slate-500 focus:ring-indigo-500 dark:focus:ring-indigo-400'
const TEXTAREA_ERROR = 'border-red-400 dark:border-red-500 focus:ring-red-400 dark:focus:ring-red-500'


function FieldError({ error }) {
  if (!error) return null
  return <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
}

function validate(data) {
  const errors = {}
  if (!data.title || data.title.trim().length < 3)
    errors.title = 'Title must be at least 3 characters'
  if (!data.discipline || data.discipline.trim().length < 2)
    errors.discipline = 'Discipline must be at least 2 characters'
  if (!data.summary || data.summary.trim().length < 10)
    errors.summary = 'Summary must be at least 10 characters'
  if (!data.contents || data.contents.trim().length < 10)
    errors.contents = 'Contents must be at least 10 characters'
  if (!data.scheduledAt || data.scheduledAt.trim().length === 0)
    errors.scheduledAt = 'Scheduled date is required'
  return errors
}

function parseApiErrors(error) {
  if (error.data?.issues?.length) {
    const errors = {}
    error.data.issues.forEach(({ path, message }) => {
      errors[path] = humanizeZodMessage(message)
    })
    return errors
  }
  return { _form: error.data?.error || error.message || 'Failed to save plan' }
}

function humanizeZodMessage(msg) {
  return msg
    .replace(/String must contain at least (\d+) character\(s\)/, 'Must be at least $1 characters')
    .replace(/String must contain at most (\d+) character\(s\)/, 'Must be at most $1 characters')
    .replace(/Required/, 'This field is required')
    .replace(/Invalid datetime/, 'Invalid date format')
}

export default function LessonPlanForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const { data: existingPlan, isLoading: isLoadingPlan } = useLessonPlan(id)
  const createMutation = useCreateLessonPlan()
  const updateMutation = useUpdateLessonPlan()

  const [formData, setFormData] = useState({
    title: '',
    discipline: '',
    objective: '',
    summary: '',
    contents: '',
    tags: [],
    scheduledAt: '',
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && existingPlan) {
      setFormData({
        title: existingPlan.title || '',
        discipline: existingPlan.discipline || '',
        objective: existingPlan.objective || '',
        summary: existingPlan.summary || '',
        contents: existingPlan.contents || '',
        tags: existingPlan.tags || [],
        scheduledAt: existingPlan.scheduledAt
          ? new Date(existingPlan.scheduledAt).toISOString().split('T')[0]
          : '',
      })
    }
  }, [existingPlan, isEdit])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined })
    }
  }

  const handleAIApply = (result) => {
    setFormData((prev) => ({
      ...prev,
      contents: result.contents || prev.contents,
      tags: result.tags?.length
        ? [...new Set([...prev.tags, ...result.tags])]
        : prev.tags,
    }))
    setFieldErrors((prev) => ({ ...prev, contents: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate(formData)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const submitData = {
        ...formData,
        tags: Array.isArray(formData.tags)
          ? formData.tags
          : formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        scheduledAt: formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : null,
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: submitData })
      } else {
        await createMutation.mutateAsync(submitData)
      }

      navigate('/plans')
    } catch (error) {
      setFieldErrors(parseApiErrors(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPlan) return <SkeletonLoader count={6} height="h-12" />

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        {isEdit ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Basic Information</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Input
                name="title"
                placeholder="Lesson plan title *"
                value={formData.title}
                onChange={handleInputChange}
              />
              <FieldError error={fieldErrors.title} />
            </div>
            <div>
              <Input
                name="discipline"
                placeholder="Discipline / Subject *"
                value={formData.discipline}
                onChange={handleInputChange}
              />
              <FieldError error={fieldErrors.discipline} />
            </div>
            <div>
              <Input
                name="objective"
                placeholder="Learning objective"
                value={formData.objective}
                onChange={handleInputChange}
              />
              <FieldError error={fieldErrors.objective} />
            </div>
            <div>
              <textarea
                name="summary"
                placeholder="Lesson summary * (min. 10 characters)"
                value={formData.summary}
                onChange={handleInputChange}
                className={`${TEXTAREA_BASE} ${fieldErrors.summary ? TEXTAREA_ERROR : TEXTAREA_NORMAL}`}
                rows="3"
              />
              <FieldError error={fieldErrors.summary} />
            </div>
          </CardBody>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Content & Details</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <textarea
                name="contents"
                placeholder="Detailed lesson content * (min. 10 characters)"
                value={formData.contents}
                onChange={handleInputChange}
                className={`${TEXTAREA_BASE} ${fieldErrors.contents ? TEXTAREA_ERROR : TEXTAREA_NORMAL}`}
                rows="5"
              />
              <FieldError error={fieldErrors.contents} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Tags (comma-separated)
              </label>
              <Input
                name="tags"
                placeholder="e.g. mathematics, algebra, grade-9"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Scheduled date
              </label>
              <Input
                name="scheduledAt"
                type="date"
                value={formData.scheduledAt}
                onChange={handleInputChange}
              />
              <FieldError error={fieldErrors.scheduledAt} />
            </div>
          </CardBody>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Recommendations</h3>
          </CardHeader>
          <CardBody>
            <SmartAssistPanel
              title={formData.title}
              discipline={formData.discipline}
              summary={formData.summary}
              onApply={handleAIApply}
            />
          </CardBody>
        </Card>

        {/* General form error */}
        {fieldErrors._form && (
          <div className="px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{fieldErrors._form}</p>
          </div>
        )}

        {/* Submit */}
        <CardFooter className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          <Button type="button" variant="outline" onClick={() => navigate('/plans')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}
