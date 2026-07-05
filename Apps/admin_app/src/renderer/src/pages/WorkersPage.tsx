import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWorkers, inviteWorker, updateWorker } from '@/api/client'
import { EmptyState, PageHeader } from '@/components/ui'
import type { UserStatus } from '@/types'

const STATUS_STYLE: Record<UserStatus, string> = {
  active: 'bg-emerald-500/20 text-emerald-300',
  invited: 'bg-amber-500/20 text-amber-300',
  deactivated: 'bg-red-500/20 text-red-300'
}

export function WorkersPage() {
  const queryClient = useQueryClient()
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workers'],
    queryFn: fetchWorkers
  })

  const inviteMutation = useMutation({
    mutationFn: () => inviteWorker({ name: inviteName.trim(), phone: invitePhone.trim() }),
    onSuccess: (worker) => {
      setMessage(`Invite sent to ${worker.name} at ${worker.phone}.`)
      setError(null)
      setInvitePhone('')
      setInviteName('')
      void queryClient.invalidateQueries({ queryKey: ['workers'] })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Invite failed.')
      setMessage(null)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: UserStatus }) => updateWorker(id, { status }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['workers'] })
  })

  const workers = data ?? []

  function handleInvite(event: FormEvent) {
    event.preventDefault()
    if (!invitePhone.startsWith('+250') || inviteName.trim().length < 2) {
      setError('Enter a valid +250 phone number and worker name.')
      return
    }
    inviteMutation.mutate()
  }

  return (
    <div>
      <PageHeader
        title="Worker Management"
        description="Invite field workers and activate or deactivate accounts."
      />

      <div className="space-y-6 px-8 py-6">
        <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Invite Worker
          </h3>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={handleInvite}>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Worker name"
              required
              className="rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
            <input
              type="tel"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              placeholder="+250788123456"
              required
              className="rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite SMS'}
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </section>

        {isLoading ? (
          <EmptyState title="Loading workers..." description="Fetching worker list." />
        ) : isError ? (
          <EmptyState title="Could not load workers" description="Check your connection and ensure the Laravel API is running." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-cir-border">
            <table className="min-w-full divide-y divide-cir-border text-sm">
              <thead className="bg-cir-surface/80">
                <tr className="text-left text-slate-400">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Active Tasks</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cir-border bg-cir-bg/40">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-cir-surface/60">
                    <td className="px-4 py-3 font-medium text-white">{worker.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{worker.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[worker.status]}`}
                      >
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{worker.active_task_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {worker.status !== 'active' ? (
                          <button
                            type="button"
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: worker.id, status: 'active' })}
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Activate
                          </button>
                        ) : null}
                        {worker.status !== 'deactivated' ? (
                          <button
                            type="button"
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: worker.id, status: 'deactivated' })}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Deactivate
                          </button>
                        ) : null}
                        {worker.status === 'invited' ? (
                          <button
                            type="button"
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: worker.id, status: 'active' })}
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Mark active
                          </button>
                        ) : null}
                      </div>
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
