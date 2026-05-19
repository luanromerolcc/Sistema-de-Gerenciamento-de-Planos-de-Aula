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
      if (!result || !onApply) {
        if (error) console.error('Smart Assist error:', error)
        return
      }
      // Silently apply the parsed result (contents, resources, tags)
      onApply(result)
      setApplied(true)
      // Show success message for 3 seconds
      setTimeout(() => setApplied(false), 3000)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCached && (
            <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full" style={{ fontSize: 11 }}>
              <Database size={12} />
              cached
            </span>
          )}
          {applied && !isLoading && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check size={14} />
              Fields updated
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
          {isLoading ? 'Generating...' : 'Get Suggestions'}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-2">
          <div className="animate-spin">
            <Sparkles size={16} className="text-indigo-500" />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Analyzing lesson content...
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error.message}</p>
      )}
    </div>
  )
}
