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
    errors.title = 'O título deve ter pelo menos 3 caracteres'
  if (!data.discipline || data.discipline.trim().length < 2)
    errors.discipline = 'A disciplina deve ter pelo menos 2 caracteres'
  if (!data.summary || data.summary.trim().length < 10)
    errors.summary = 'O resumo deve ter pelo menos 10 caracteres'
  if (!data.contents || data.contents.trim().length < 10)
    errors.contents = 'O conteúdo deve ter pelo menos 10 caracteres'
  if (!data.scheduledAt || data.scheduledAt.trim().length === 0)
    errors.scheduledAt = 'A data prevista é obrigatória'
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
  return { _form: error.data?.error || error.message || 'Falha ao salvar o plano' }
}

function humanizeZodMessage(msg) {
  return msg
    .replace(/String must contain at least (\d+) character\(s\)/, 'Deve ter pelo menos $1 caracteres')
    .replace(/String must contain at most (\d+) character\(s\)/, 'Deve ter no máximo $1 caracteres')
    .replace(/Required/, 'Este campo é obrigatório')
    .replace(/Invalid datetime/, 'Formato de data inválido')
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
        {isEdit ? 'Editar Plano de Aula' : 'Novo Plano de Aula'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Informações Básicas</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Input
                name="title"
                placeholder="Título do plano *"
                value={formData.title}
                onChange={handleInputChange}
              />
              <FieldError error={fieldErrors.title} />
            </div>
            <div>
              <Input
                name="discipline"
                placeholder="Disciplina / Matéria *"
                value={formData.discipline}
                onChange={handleInputChange}
              />
              <FieldError error={fieldErrors.discipline} />
            </div>
            <div>
              <Input
                name="objective"
                placeholder="Objetivo de aprendizagem"
                value={formData.objective}
                onChange={handleInputChange}
              />
              <FieldError error={fieldErrors.objective} />
            </div>
            <div>
              <textarea
                name="summary"
                placeholder="Resumo da aula * (mín. 10 caracteres)"
                value={formData.summary}
                onChange={handleInputChange}
                className={`${TEXTAREA_BASE} ${fieldErrors.summary ? TEXTAREA_ERROR : TEXTAREA_NORMAL}`}
                rows="3"
              />
              <FieldError error={fieldErrors.summary} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Conteúdo e Detalhes</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <textarea
                name="contents"
                placeholder="Conteúdo detalhado da aula * (mín. 10 caracteres)"
                value={formData.contents}
                onChange={handleInputChange}
                className={`${TEXTAREA_BASE} ${fieldErrors.contents ? TEXTAREA_ERROR : TEXTAREA_NORMAL}`}
                rows="5"
              />
              <FieldError error={fieldErrors.contents} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Tags (separadas por vírgula)
              </label>
              <Input
                name="tags"
                placeholder="ex: matemática, álgebra, 9º-ano"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Data prevista
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

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Assistente de IA</h3>
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

        {fieldErrors._form && (
          <div className="px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{fieldErrors._form}</p>
          </div>
        )}

        <CardFooter className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          <Button type="button" variant="outline" onClick={() => navigate('/plans')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Plano'}
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}
