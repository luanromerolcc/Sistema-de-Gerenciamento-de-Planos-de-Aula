import { Button } from './ui/Button'

export default function EmptyState({ title, description, primaryAction, secondaryAction }) {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .empty-state-svg { animation: float 3s ease-in-out infinite; }
      `}</style>
      <div className="flex flex-col items-center justify-center text-center max-w-[400px] mx-auto py-8 px-4">
        <svg
          className="empty-state-svg mb-5 text-slate-400 dark:text-slate-500"
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stack of books */}
          <rect x="12" y="50" width="56" height="10" rx="2" />
          <rect x="16" y="38" width="48" height="10" rx="2" />
          <rect x="20" y="26" width="40" height="10" rx="2" />
          {/* Open book on top */}
          <path d="M28 22 C28 16 36 14 40 14 C44 14 52 16 52 22" />
          <line x1="40" y1="14" x2="40" y2="26" />
        </svg>

        <h3 className="text-base font-medium text-slate-900 dark:text-slate-50 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{description}</p>

        <div className="flex gap-3">
          {primaryAction && (
            <Button variant="default" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
