import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

export function EmptyState({
  title = 'No data yet',
  description = 'Get started by creating your first item',
  actionLabel = 'Create New',
  onAction,
}) {
  const navigate = useNavigate()

  const handleAction = () => {
    if (onAction) {
      onAction()
    } else {
      navigate('/create')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <BookOpen size={24} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-base font-medium text-slate-900 dark:text-slate-50 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{description}</p>
      <Button onClick={handleAction}>{actionLabel}</Button>
    </div>
  )
}
