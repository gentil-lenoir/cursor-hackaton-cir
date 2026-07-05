import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  approveAdminTask,
  createTaskComment,
  deleteAdminTask,
  fetchAdminTask,
  fetchWorkers,
  rejectAdminTask,
  updateAdminTask
} from '@/api/client'
import { EmptyState } from '@/components/ui'
import type { TaskStatus } from '@/types'

const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'review', 'done', 'blocked']

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const taskId = Number(id)

  const [commentBody, setCommentBody] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const taskQuery = useQuery({
    queryKey: ['admin-task', taskId],
    queryFn: () => fetchAdminTask(taskId),
    enabled: !Number.isNaN(taskId)
  })

  const workersQuery = useQuery({
    queryKey: ['workers'],
    queryFn: fetchWorkers
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-task', taskId] })
    void queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-issues'] })
    void queryClient.invalidateQueries({ queryKey: ['workers'] })
  }

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminTask>[1]) => updateAdminTask(taskId, payload),
    onSuccess: () => {
      invalidate()
      setMessage('Task updated.')
    }
  })

  const approveMutation = useMutation({
    mutationFn: () => approveAdminTask(taskId),
    onSuccess: () => {
      invalidate()
      setMessage('Task approved. Issue marked resolved.')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectAdminTask(taskId),
    onSuccess: () => {
      invalidate()
      setMessage('Task sent back to in progress.')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminTask(taskId),
    onSuccess: () => {
      void navigate('/tasks')
    }
  })

  const commentMutation = useMutation({
    mutationFn: (body: string) => createTaskComment(taskId, { body }),
    onSuccess: () => {
      setCommentBody('')
      invalidate()
    }
  })

  if (Number.isNaN(taskId)) {
    return (
      <div className="px-8 py-6">
        <EmptyState title="Invalid task ID" description="The task ID provided is not valid." />
      </div>
    )
  }

  if (taskQuery.isLoading) {
    return (
      <div className="px-8 py-6">
        <EmptyState title="Loading task..." description="Fetching task details." />
      </div>
    )
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <div className="px-8 py-6">
        <EmptyState title="Task not found" description="This task may have been deleted." />
      </div>
    )
  }

  const task = taskQuery.data
  const activeWorkers = (workersQuery.data ?? []).filter((w) => w.status === 'active')
  const completedSteps = task.steps.filter((s) => s.is_completed).length

  function handleCommentSubmit(event: FormEvent) {
    event.preventDefault()
    if (!commentBody.trim()) return
    commentMutation.mutate(commentBody.trim())
  }

  return (
    <div>
      <div className="border-b border-cir-border px-8 py-4">
        <Link to="/tasks" className="text-sm text-slate-400 hover:text-white">
          &larr; Back to Tasks
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-white">{task.title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          <Link to={`/inbox/${task.issue_id}`} className="text-emerald-300 hover:underline">
            {task.issue_reference}
          </Link>{' '}
          · {task.district} · {task.assigned_to_name}
        </p>
      </div>

      <div className="space-y-6 px-8 py-6">
        {message ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            {message}
          </p>
        ) : null}

        <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">Edit Task</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Status
              <select
                value={task.status}
                onChange={(e) => updateMutation.mutate({ status: e.target.value as TaskStatus })}
                className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Reassign worker
              <select
                value={task.assigned_to}
                onChange={(e) => updateMutation.mutate({ assigned_to: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                {activeWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Due date
              <input
                type="date"
                value={task.due_date ?? ''}
                onChange={(e) => updateMutation.mutate({ due_date: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2">
              Admin notes
              <textarea
                rows={2}
                defaultValue={task.admin_notes ?? ''}
                onBlur={(e) => {
                  const value = e.target.value.trim() || null
                  if (value !== task.admin_notes) {
                    updateMutation.mutate({ admin_notes: value })
                  }
                }}
                className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={task.status === 'done' || approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Approve (resolve issue)
            </button>
            <button
              type="button"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
              className="rounded-lg border border-amber-600/50 bg-amber-600/10 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-600/20 disabled:opacity-60"
            >
              Reject (back to in progress)
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm('Delete this task permanently?')) {
                  deleteMutation.mutate()
                }
              }}
              className="rounded-lg border border-red-600/50 bg-red-600/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-600/20 disabled:opacity-60"
            >
              Delete task
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Checklist ({completedSteps}/{task.steps.length})
          </h3>
          {task.steps.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No steps defined.</p>
          ) : (
            <ul className="space-y-2">
              {task.steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center gap-3 rounded-lg bg-cir-bg/50 px-3 py-2 text-sm"
                >
                  <span className={step.is_completed ? 'text-emerald-400' : 'text-slate-500'}>
                    {step.is_completed ? '✓' : '○'}
                  </span>
                  <span className={step.is_completed ? 'text-slate-400 line-through' : 'text-slate-200'}>
                    {step.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Internal Comments
          </h3>
          <form className="mb-4 flex gap-2" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add internal comment for worker..."
              className="flex-1 rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={commentMutation.isPending || !commentBody.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Post
            </button>
          </form>
          <div className="space-y-3">
            {task.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-cir-border-subtle/50 bg-cir-bg/40 px-4 py-3">
                <p className="text-sm text-slate-200">{comment.body}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {comment.author_name}
                  {comment.type === 'clarification_request' ? ' · clarification request' : ''} ·{' '}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
