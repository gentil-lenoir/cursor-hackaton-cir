import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchAdminIssues } from '@/api/client'
import { EmptyState, PageHeader, PriorityBadge, StatusBadge } from '@/components/ui'
import type { IssueStatus } from '@/types'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' }
]

export function IssueInboxPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [district, setDistrict] = useState('')

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      district: district || undefined,
      sort: 'final_priority'
    }),
    [search, status, district]
  )

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-issues', queryParams],
    queryFn: () => fetchAdminIssues(queryParams)
  })

  const issues = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Issue Inbox"
        description="Review citizen reports, AI triage results, and community urgency."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Refresh
          </button>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or reference..."
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            placeholder="Filter by district..."
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
          />
        </div>

        {isLoading ? (
          <EmptyState title="Loading issues..." description="Fetching the latest reports from the API." />
        ) : isError ? (
          <EmptyState
            title="Could not load issues"
            description={
              error instanceof Error
                ? error.message
                : 'Make sure the Laravel backend is running and admin endpoints are available.'
            }
          />
        ) : issues.length === 0 ? (
          <EmptyState
            title="No issues found"
            description="Once citizens submit reports, they will appear here sorted by final priority."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80">
                <tr className="text-left text-slate-400">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">District</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Final Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="cursor-pointer hover:bg-slate-900/60"
                    onClick={() => navigate(`/inbox/${issue.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-sky-300">{issue.reference_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{issue.title}</p>
                      {issue.ai_summary ? (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-400">{issue.ai_summary}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{issue.district}</td>
                    <td className="px-4 py-3 capitalize text-slate-300">{issue.ai_category ?? 'Pending'}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={issue.final_priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={issue.status as IssueStatus} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
