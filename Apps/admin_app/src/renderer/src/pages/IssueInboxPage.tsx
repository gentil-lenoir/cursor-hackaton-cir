import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { bulkUpdateAdminIssues, fetchAdminIssues } from '@/api/client'
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

const BULK_STATUSES: IssueStatus[] = ['under_review', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed']

export function IssueInboxPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [district, setDistrict] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<IssueStatus>('under_review')

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

  const bulkMutation = useMutation({
    mutationFn: () => bulkUpdateAdminIssues({ issue_ids: [...selected], status: bulkStatus }),
    onSuccess: () => {
      setSelected(new Set())
      void queryClient.invalidateQueries({ queryKey: ['admin-issues'] })
    }
  })

  const issues = data?.data ?? []

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === issues.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(issues.map((i) => i.id)))
    }
  }

  return (
    <div>
      <PageHeader
        title="Issue Inbox"
        description="Review citizen reports, AI triage results, and community urgency."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-cir-border-subtle px-3 py-2 text-sm text-slate-300 hover:border-emerald-700/50 hover:text-white"
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
            className="rounded-lg border border-cir-border-subtle bg-cir-surface px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-cir-border-subtle bg-cir-surface px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
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
            className="rounded-lg border border-cir-border-subtle bg-cir-surface px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>

        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <span className="text-sm text-emerald-200">{selected.size} selected</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as IssueStatus)}
              className="rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-1.5 text-sm text-white"
            >
              {BULK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={bulkMutation.isPending}
              onClick={() => bulkMutation.mutate()}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Apply bulk status
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        ) : null}

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
          <div className="overflow-hidden rounded-xl border border-cir-border">
            <table className="min-w-full divide-y divide-cir-border text-sm">
              <thead className="bg-cir-surface/80">
                <tr className="text-left text-slate-400">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === issues.length && issues.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all issues"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">District</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Final Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cir-border bg-cir-bg/40">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="cursor-pointer hover:bg-cir-surface/60"
                    onClick={() => navigate(`/inbox/${issue.id}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(issue.id)}
                        onChange={() => toggleSelect(issue.id)}
                        aria-label={`Select ${issue.reference_number}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-300">{issue.reference_number}</td>
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
