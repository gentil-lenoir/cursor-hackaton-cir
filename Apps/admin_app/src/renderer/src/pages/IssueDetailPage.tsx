import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  fetchAdminIssue,
  fetchIssueActivity,
  fetchIssueComments,
  updateAdminIssue
} from '@/api/client'
import { EmptyState, PageHeader, PriorityBadge, StatusBadge } from '@/components/ui'
import type { IssueStatus } from '@/types'

const STATUS_TRANSITIONS: Array<{ value: IssueStatus; label: string }> = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' }
]

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const issueId = Number(id)

  const [priorityOverride, setPriorityOverride] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const issueQuery = useQuery({
    queryKey: ['admin-issue', issueId],
    queryFn: () => fetchAdminIssue(issueId),
    enabled: !Number.isNaN(issueId)
  })

  const commentsQuery = useQuery({
    queryKey: ['issue-comments', issueId],
    queryFn: () => fetchIssueComments(issueId),
    enabled: !Number.isNaN(issueId)
  })

  const activityQuery = useQuery({
    queryKey: ['issue-activity', issueId],
    queryFn: () => fetchIssueActivity(issueId),
    enabled: !Number.isNaN(issueId)
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { status?: string; admin_priority_override?: number | null }) =>
      updateAdminIssue(issueId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-issue', issueId], updated)
      void queryClient.invalidateQueries({ queryKey: ['admin-issues'] })
    }
  })

  if (Number.isNaN(issueId)) {
    return (
      <div className="px-8 py-6">
        <EmptyState title="Invalid issue ID" description="The issue ID provided is not valid." />
      </div>
    )
  }

  if (issueQuery.isLoading) {
    return (
      <div className="px-8 py-6">
        <EmptyState title="Loading issue..." description="Fetching the issue details from the API." />
      </div>
    )
  }

  if (issueQuery.isError) {
    return (
      <div className="px-8 py-6">
        <EmptyState
          title="Could not load issue"
          description={
            issueQuery.error instanceof Error
              ? issueQuery.error.message
              : 'Make sure the Laravel backend is running and the issue exists.'
          }
        />
      </div>
    )
  }

  const issue = issueQuery.data
  const comments = commentsQuery.data ?? []
  const activity = activityQuery.data ?? []

  return (
    <div>
      <div className="border-b border-slate-800 px-8 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/inbox"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            &larr; Back to Inbox
          </Link>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-sm text-sky-300">{issue.reference_number}</span>
          <StatusBadge status={issue.status as IssueStatus} />
          <PriorityBadge priority={issue.final_priority} />
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-white">{issue.title}</h2>
      </div>

      <div className="space-y-6 px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-400">
              Report Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Reporter</dt>
                <dd className="text-white">{issue.reporter_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">District</dt>
                <dd className="text-white">{issue.district}</dd>
              </div>
              {issue.sector ? (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Sector</dt>
                  <dd className="text-white">{issue.sector}</dd>
                </div>
              ) : null}
              {issue.latitude && issue.longitude ? (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Location</dt>
                  <dd className="text-white">
                    {issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-slate-400">Submitted</dt>
                <dd className="text-white">
                  {new Date(issue.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <h4 className="mb-1 text-xs font-medium uppercase text-slate-500">Description</h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {issue.description}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-400">
              AI Analysis
            </h3>
            {issue.ai_summary ? (
              <div className="mb-4">
                <h4 className="mb-1 text-xs font-medium uppercase text-slate-500">Summary</h4>
                <p className="text-sm leading-relaxed text-slate-200">{issue.ai_summary}</p>
              </div>
            ) : (
              <p className="mb-4 text-sm text-slate-400 italic">AI processing pending...</p>
            )}
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Category</dt>
                <dd className="capitalize text-white">{issue.ai_category ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">AI Priority</dt>
                <dd className="text-white">
                  {issue.ai_priority != null ? (
                    <PriorityBadge priority={issue.ai_priority} />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
              {issue.ai_confidence != null ? (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Confidence</dt>
                  <dd className="text-white">{(issue.ai_confidence * 100).toFixed(0)}%</dd>
                </div>
              ) : null}
              {issue.ai_tags && issue.ai_tags.length > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Tags</dt>
                  <dd className="flex flex-wrap gap-1">
                    {issue.ai_tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-400">
            Actions
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm text-slate-300">
                Priority Override (1–5)
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={priorityOverride ?? issue.admin_priority_override ?? issue.final_priority}
                    onChange={(e) => setPriorityOverride(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                  <span className="w-6 text-center text-sm font-medium text-white">
                    {priorityOverride ?? issue.admin_priority_override ?? issue.final_priority}
                  </span>
                </div>
              </label>
              {(priorityOverride != null || issue.admin_priority_override != null) &&
              (priorityOverride ?? issue.admin_priority_override) !== issue.final_priority ? (
                <button
                  type="button"
                  onClick={() => {
                    updateMutation.mutate({
                      admin_priority_override: priorityOverride
                    })
                  }}
                  disabled={updateMutation.isPending}
                  className="mt-2 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-60"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Apply Priority Override'}
                </button>
              ) : null}
            </div>

            <div>
              <label className="block text-sm text-slate-300">
                Change Status
                <select
                  value={selectedStatus || issue.status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                >
                  {STATUS_TRANSITIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {selectedStatus && selectedStatus !== issue.status ? (
                <button
                  type="button"
                  onClick={() => {
                    updateMutation.mutate({ status: selectedStatus })
                  }}
                  disabled={updateMutation.isPending}
                  className="mt-2 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-60"
                >
                  {updateMutation.isPending ? 'Saving...' : `Change to ${selectedStatus.replace('_', ' ')}`}
                </button>
              ) : null}
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                + Create Task &amp; Assign Worker
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-400">
            Community Activity
          </h3>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-sm text-slate-300">
              Community Score: <strong className="text-white">{issue.community_score}</strong>
            </span>
            <span className="text-sm text-slate-300">
              Comments: <strong className="text-white">{comments.length}</strong>
            </span>
          </div>

          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No public comments yet.</p>
          ) : (
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-slate-700/50 bg-slate-950/40 px-4 py-3"
                >
                  <p className="text-sm text-slate-200">{comment.body}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-400">
            Activity Log
          </h3>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No activity logged yet. {activityQuery.isError ? '(Activity endpoint may not be available yet.)' : ''}
            </p>
          ) : (
            <div className="space-y-2">
              {activity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                  <div>
                    <p className="text-slate-200">{entry.action}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
