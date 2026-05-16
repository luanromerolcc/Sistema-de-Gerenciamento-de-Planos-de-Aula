import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLessonPlan, useCreateLessonPlan, useUpdateLessonPlan } from '../hooks/useLessonPlans'
import { useSmartAssist } from '../hooks/useSmartAssist'
import { Card, CardBody, CardHeader, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'

export default function LessonPlanForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const { data: existingPlan, isLoading: isLoadingPlan } = useLessonPlan(id)
  const createMutation = useCreateLessonPlan()
  const updateMutation = useUpdateLessonPlan()
  const { getRecommendation, isLoading: isLoadingAI } = useSmartAssist()

  const [formData, setFormData] = useState({
    title: '',
    discipline: '',
    objective: '',
    summary: '',
    content: '',
    tags: [],
    scheduledAt: '',
  })

  const [aiRecommendations, setAiRecommendations] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && existingPlan) {
      setFormData({
        title: existingPlan.title || '',
        discipline: existingPlan.discipline || '',
        objective: existingPlan.objective || '',
        summary: existingPlan.summary || '',
        content: existingPlan.content || '',
        tags: existingPlan.tags || [],
        scheduledAt: existingPlan.scheduledAt ? new Date(existingPlan.scheduledAt).toISOString().split('T')[0] : '',
      })
    }
  }, [existingPlan, isEdit])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleGetAIRecommendations = async () => {
    try {
      const result = await getRecommendation({
        title: formData.title,
        discipline: formData.discipline,
        summary: formData.summary,
      })
      setAiRecommendations(result)
    } catch (error) {
      alert('Error getting AI recommendations: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.length ? formData.tags.split(',').map((t) => t.trim()) : [],
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: submitData })
      } else {
        await createMutation.mutateAsync(submitData)
      }

      navigate('/plans')
    } catch (error) {
      alert('Error saving plan: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPlan) return <SkeletonLoader count={6} height="h-12" />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">{isEdit ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Basic Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              name="title"
              placeholder="Lesson Plan Title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <Input
              name="discipline"
              placeholder="Discipline / Subject"
              value={formData.discipline}
              onChange={handleInputChange}
              required
            />
            <Input
              name="objective"
              placeholder="Learning Objective"
              value={formData.objective}
              onChange={handleInputChange}
            />
            <textarea
              name="summary"
              placeholder="Lesson Summary"
              value={formData.summary}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white dark:bg-slate-800 dark:border-slate-600 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows="4"
            />
          </CardBody>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Content & Details</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <textarea
              name="content"
              placeholder="Detailed lesson content..."
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white dark:bg-slate-800 dark:border-slate-600 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows="6"
            />
            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input
                name="tags"
                placeholder="e.g., mathematics, algebra, grade-9"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                onChange={handleInputChange}
              />
            </div>
            <Input
              name="scheduledAt"
              type="date"
              value={formData.scheduledAt}
              onChange={handleInputChange}
            />
          </CardBody>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">AI Recommendations</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGetAIRecommendations}
                disabled={isLoadingAI || !formData.title || !formData.discipline}
              >
                {isLoadingAI ? 'Loading...' : '✨ Get Suggestions'}
              </Button>
            </div>
          </CardHeader>
          {aiRecommendations && (
            <CardBody className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Suggested Contents</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{aiRecommendations.contents}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommended Resources</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{aiRecommendations.resources}</p>
              </div>
              {aiRecommendations.tags && (
                <div>
                  <h4 className="font-medium mb-2">Suggested Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiRecommendations.tags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="neutral"
                        size="sm"
                        onClick={() => {
                          if (!formData.tags.includes(tag)) {
                            setFormData({
                              ...formData,
                              tags: Array.isArray(formData.tags) ? [...formData.tags, tag] : [tag],
                            })
                          }
                        }}
                      >
                        + {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          )}
        </Card>

        {/* Submit */}
        <CardFooter>
          <Button type="button" variant="secondary" onClick={() => navigate('/plans')}>
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
