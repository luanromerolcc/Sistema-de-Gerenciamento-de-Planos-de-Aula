import { CalendarDays, Pencil, Copy, Trash2 } from 'lucide-react'

const disciplineColors = {
  Redes: '#0F6E56',
  'Matemática': '#534AB7',
  'Português': '#993C1D',
  default: '#4F46E5',
}

export default function LessonPlanCard({ plan, onClick, onEdit, onDelete, onDuplicate }) {
  const accentColor = disciplineColors[plan.discipline] ?? disciplineColors.default
  const visibleTags = plan.tags?.slice(0, 3) ?? []
  const extraTags = (plan.tags?.length ?? 0) - visibleTags.length

  return (
    <div
      onClick={() => onClick?.(plan.id)}
      style={{ borderLeft: `3px solid ${accentColor}` }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="truncate font-medium text-slate-900 dark:text-slate-50"
            style={{ fontSize: 15 }}
          >
            {plan.title}
          </p>
          {plan.objective && (
            <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              {plan.objective}
            </p>
          )}
        </div>
      </div>

      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full"
              style={{ fontSize: 11 }}
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span
              className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full"
              style={{ fontSize: 11 }}
            >
              +{extraTags} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <CalendarDays size={14} />
          <span className="text-xs">
            {plan.scheduledAt
              ? new Date(plan.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'}
          </span>
        </div>
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit?.(plan.id)}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDuplicate?.(plan.id)}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onDelete?.(plan.id)}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-red-400 dark:text-red-500"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
