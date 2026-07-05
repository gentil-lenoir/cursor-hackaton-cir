import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchAdminTasks } from '@/api/client'
import { EmptyState, PageHeader } from '@/components/ui'
import type { TaskStatus } from '@/types'

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  blocked: 'Blocked'
}

const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
  todo: 'bg-cir-elevated/60 text-slate-300',
  in_progress: 'bg-amber-500/20 text-amber-300',
  review: 'bg-violet-500/20 text-violet-300',
  done: 'bg-emerald-500/20 text-emerald-300',
  blocked: 'bg-red-500/20 text-red-300'
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TASK_STATUS_STYLE[status]}`}>
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}

export function TasksPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: fetchAdminTasks
  })

  const tasks = useMemo(() => {
    let results = data ?? []
    if (statusFilter) results = results.filter((t) => t.status === statusFilter)
    if (districtFilter) {
      const q = districtFilter.toLowerCase()
      results = results.filter((t) => t.district.toLowerCase().includes(q))
    }
    return results
  }, [data, statusFilter, districtFilter])

  return (
    <div>
      <PageHeader
        title="Task Oversight"
        description="Monitor all worker tasks — click a row to view, edit, approve, or delete."
      />

      <div className="space-y-4 px-8 py-6">
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-cir-border-subtle bg-cir-surface px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="">All statuses</option>
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            placeholder="Filter by district..."
            className="rounded-lg border border-cir-border-subtle bg-cir-surface px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>

        {isLoading ? (
          <EmptyState title="Loading tasks..." description="Fetching assigned tasks." />
        ) : isError ? (
          <EmptyState title="Could not load tasks" description="Check your connection and ensure the Laravel API is running." />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Assign a worker from an issue detail page to create a task."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-cir-border">
            <table className="min-w-full divide-y divide-cir-border text-sm">
              <thead className="bg-cir-surface/80">
                <tr className="text-left text-slate-400">
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Worker</th>
                  <th className="px-4 py-3 font-medium">District</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cir-border bg-cir-bg/40">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-cir-surface/60">
                    <td className="px-4 py-3">
                      <Link to={`/tasks/${task.id}`} className="font-medium text-emerald-300 hover:underline">
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/inbox/${task.issue_id}`} className="text-slate-300 hover:text-white">
                        {task.issue_reference}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{task.issue_title}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{task.assigned_to_name}</td>
                    <td className="px-4 py-3 text-slate-300">{task.district}</td>
                    <td className="px-4 py-3">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
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
