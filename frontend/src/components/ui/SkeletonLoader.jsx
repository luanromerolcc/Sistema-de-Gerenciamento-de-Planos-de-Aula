export function SkeletonLoader({ count = 1, height = 'h-12', className = '' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-slate-200 dark:bg-slate-800 rounded-lg mb-3 animate-pulse last:mb-0`} />
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-lg h-48 animate-pulse" />
      ))}
    </div>
  )
}
