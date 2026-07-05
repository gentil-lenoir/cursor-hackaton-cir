import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppLayout } from '@/components/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { IssueDetailPage } from '@/pages/IssueDetailPage'
import { IssueInboxPage } from '@/pages/IssueInboxPage'
import { LoginPage } from '@/pages/LoginPage'
import { ModerationPage } from '@/pages/ModerationPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { TasksPage } from '@/pages/TasksPage'
import { WorkersPage } from '@/pages/WorkersPage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/inbox" element={<IssueInboxPage />} />
                <Route path="/inbox/:id" element={<IssueDetailPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                <Route path="/workers" element={<WorkersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/moderation" element={<ModerationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/inbox" replace />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/inbox" replace />} />
          </Routes>
          </HashRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
