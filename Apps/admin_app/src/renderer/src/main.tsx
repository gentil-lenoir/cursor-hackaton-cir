import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { IssueDetailPage } from '@/pages/IssueDetailPage'
import { IssueInboxPage } from '@/pages/IssueInboxPage'
import { LoginPage } from '@/pages/LoginPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/inbox" element={<IssueInboxPage />} />
                <Route path="/inbox/:id" element={<IssueDetailPage />} />
                <Route
                  path="/tasks"
                  element={
                    <PlaceholderPage
                      title="Task Oversight"
                      description="Monitor worker tasks, progress updates, and approvals."
                    />
                  }
                />
                <Route
                  path="/workers"
                  element={
                    <PlaceholderPage
                      title="Worker Management"
                      description="Invite workers, manage status, and review assignments."
                    />
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <PlaceholderPage
                      title="Analytics Dashboard"
                      description="KPIs and charts for issue volume, districts, and worker performance."
                    />
                  }
                />
                <Route
                  path="/moderation"
                  element={
                    <PlaceholderPage
                      title="Comment Moderation"
                      description="Review flagged public comments and take action."
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PlaceholderPage
                      title="Settings"
                      description="Configure priority weights, districts, and notification templates."
                    />
                  }
                />
                <Route path="/" element={<Navigate to="/inbox" replace />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/inbox" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
