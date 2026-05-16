import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme } from './hooks/useTheme'
import Dashboard from './pages/Dashboard'
import LessonPlansPage from './pages/LessonPlansPage'
import CreatePlanPage from './pages/CreatePlanPage'
import EditPlanPage from './pages/EditPlanPage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 }, // 5 minutes
    mutations: { retry: 1 },
  },
})

export default function App() {
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
          {/* Header */}
          <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">📚 Lesson Plan Manager</h1>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </header>

          {/* Main Routes */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plans" element={<LessonPlansPage />} />
              <Route path="/create" element={<CreatePlanPage />} />
              <Route path="/edit/:id" element={<EditPlanPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  )
}