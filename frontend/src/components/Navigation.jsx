import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, LayoutDashboard, BookText, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={15} /> },
    { label: 'Lesson Plans', path: '/plans', icon: <BookText size={15} /> },
  ]

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <BookOpen size={20} className="text-indigo-600 flex-shrink-0" />
          <span className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Lesson Plan Manager
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <nav className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`py-2.5 px-3 flex items-center gap-1.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                location.pathname === item.path
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}
