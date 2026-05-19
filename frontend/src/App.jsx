import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme } from './hooks/useTheme'
import Navigation from './components/Navigation'
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
  const { isDark } = useTheme()

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
          <Navigation />

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