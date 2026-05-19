import { useState } from 'react'
import { Database, Sparkles, Check } from 'lucide-react'
import { useSmartAssist } from '../hooks/useSmartAssist'
import { Button } from './ui/Button'

export default function SmartAssistPanel({ title, discipline, summary, onApply }) {
  const { stream, isLoading, isCached, error } = useSmartAssist()
  const [applied, setApplied] = useState(false)

  const handleGetSuggestions = () => {
    setApplied(false)
    stream({ title, discipline, summary }, (result) => {
      if (!result || !onApply) return
      onApply(result)
      setApplied(true)
      setTimeout(() => setApplied(false), 3000)
    })
  }

  return (
    <div data-testid="smart-assist-panel" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCached && (
            <span
              data-testid="cached-badge"
              className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full"
              style={{ fontSize: 11 }}
            >
              <Database size={12} />
              Resposta em cache
            </span>
          )}
          {applied && !isLoading && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check size={14} />
              Campos preenchidos
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleGetSuggestions}
          disabled={isLoading || !title || !discipline}
        >
          <Sparkles size={14} className="mr-1" />
          {isLoading ? 'Gerando...' : 'Gerar Recomendações'}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-2">
          <div className="animate-spin">
            <Sparkles size={16} className="text-indigo-500" />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Analisando conteúdo da aula...
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error.message}</p>
      )}
    </div>
  )
}
