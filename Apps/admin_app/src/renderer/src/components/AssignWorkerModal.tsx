import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminTask, fetchWorkers } from '@/api/client'
import type { Issue } from '@/types'

interface AssignWorkerModalProps {
  issue: Issue
  onClose: () => void
  onSuccess: () => void
}

export function AssignWorkerModal({ issue, onClose, onSuccess }: AssignWorkerModalProps) {
  const queryClient = useQueryClient()
  const [workerId, setWorkerId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [steps, setSteps] = useState('Inspect site\nExecute repair\nSubmit report')

  const workersQuery = useQuery({
    queryKey: ['workers'],
    queryFn: fetchWorkers
  })

  const assignMutation = useMutation({
    mutationFn: () =>
      createAdminTask({
        issue_id: issue.id,
        assigned_to: Number(workerId),
        due_date: dueDate || undefined,
        admin_notes: notes || undefined,
        steps: steps.split('\n').map((s) => s.trim()).filter(Boolean)
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-issue', issue.id] })
      void queryClient.invalidateQueries({ queryKey: ['admin-issues'] })
      void queryClient.invalidateQueries({ queryKey: ['issue-activity', issue.id] })
      void queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['workers'] })
      onSuccess()
      onClose()
    }
  })

  const activeWorkers = (workersQuery.data ?? []).filter((w) => w.status === 'active')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!workerId) return
    assignMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-cir-border-subtle bg-cir-surface p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">Assign Worker</h3>
        <p className="mt-1 text-sm text-slate-400">
          {issue.reference_number} — {issue.title}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-300">
            Worker
            <select
              required
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
            >
              <option value="">Select worker...</option>
              {activeWorkers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.phone}) — {worker.active_task_count ?? 0} active tasks
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Admin notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
              placeholder="Instructions for the worker..."
            />
          </label>

          <label className="block text-sm text-slate-300">
            Checklist steps (one per line)
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 font-mono text-sm text-white outline-none focus:border-emerald-500"
            />
          </label>

          {assignMutation.isError ? (
            <p className="text-sm text-red-300">
              {assignMutation.error instanceof Error ? assignMutation.error.message : 'Assignment failed'}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-cir-border-subtle px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending || !workerId}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
