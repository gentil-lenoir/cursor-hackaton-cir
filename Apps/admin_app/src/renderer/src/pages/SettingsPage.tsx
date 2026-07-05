import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAdminSettings, updateAdminSettings } from '@/api/client'
import { EmptyState, PageHeader } from '@/components/ui'
import type { AdminSettings, NotificationTemplates, PriorityWeights } from '@/types'

type SettingsTab = 'priority' | 'ai' | 'notifications' | 'districts'

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: 'priority', label: 'Priority Weights' },
  { id: 'ai', label: 'AI Prompt' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'districts', label: 'Districts' }
]

function weightsSum(weights: PriorityWeights): number {
  return weights.citizen + weights.ai + weights.community
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<SettingsTab>('priority')
  const [draft, setDraft] = useState<AdminSettings | null>(null)
  const [newDistrict, setNewDistrict] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchAdminSettings
  })

  useEffect(() => {
    if (data) {
      setDraft(structuredClone(data))
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: (updated) => {
      setDraft(structuredClone(updated))
      queryClient.setQueryData(['admin-settings'], updated)
      setMessage('Settings saved successfully.')
      setError(null)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save settings.')
      setMessage(null)
    }
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!draft) return

    const sum = weightsSum(draft.priority_weights)
    if (Math.abs(sum - 1) > 0.001) {
      setError(`Priority weights must sum to 1.0 (currently ${sum.toFixed(2)}).`)
      setMessage(null)
      return
    }

    saveMutation.mutate({
      priority_weights: draft.priority_weights,
      ai_prompt_template: draft.ai_prompt_template,
      notification_templates: draft.notification_templates,
      districts: draft.districts
    })
  }

  function updateTemplates(key: keyof NotificationTemplates, value: string) {
    if (!draft) return
    setDraft({
      ...draft,
      notification_templates: { ...draft.notification_templates, [key]: value }
    })
  }

  function addDistrict() {
    const name = newDistrict.trim()
    if (!draft || !name) return
    if (draft.districts.some((d) => d.toLowerCase() === name.toLowerCase())) {
      setError('District already exists.')
      return
    }
    setDraft({ ...draft, districts: [...draft.districts, name].sort() })
    setNewDistrict('')
    setError(null)
  }

  function removeDistrict(name: string) {
    if (!draft) return
    setDraft({ ...draft, districts: draft.districts.filter((d) => d !== name) })
  }

  if (isLoading || !draft) {
    return (
      <div>
        <PageHeader title="Settings" description="Configure CIR platform behavior." />
        <div className="px-8 py-6">
          <EmptyState title="Loading settings..." description="Fetching configuration from the API." />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <PageHeader title="Settings" description="Configure CIR platform behavior." />
        <div className="px-8 py-6">
          <EmptyState title="Could not load settings" description="Check your API connection." />
        </div>
      </div>
    )
  }

  const weightTotal = weightsSum(draft.priority_weights)

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Priority formula weights, AI triage prompt, SMS/push templates, and Rwanda districts."
      />

      <div className="px-8 py-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'border border-cir-border-subtle text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          {tab === 'priority' ? (
            <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Priority Weights
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Must sum to 1.0. Used in final_priority = citizen×w₁ + AI×w₂ + community×w₃.
              </p>
              <div className="mt-4 space-y-4">
                {(
                  [
                    ['citizen', 'Citizen priority'],
                    ['ai', 'AI priority'],
                    ['community', 'Community score']
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-sm text-slate-300">
                    {label}
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={draft.priority_weights[key]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          priority_weights: {
                            ...draft.priority_weights,
                            [key]: Number(e.target.value)
                          }
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                ))}
              </div>
              <p
                className={`mt-3 text-sm ${Math.abs(weightTotal - 1) < 0.001 ? 'text-emerald-400' : 'text-amber-400'}`}
              >
                Total: {weightTotal.toFixed(2)} {Math.abs(weightTotal - 1) < 0.001 ? '✓' : '(must equal 1.00)'}
              </p>
            </section>
          ) : null}

          {tab === 'ai' ? (
            <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                AI Triage Prompt Template
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Super-admin only. Variables: {'{title}'}, {'{description}'}, {'{district}'}.
              </p>
              <textarea
                rows={12}
                value={draft.ai_prompt_template}
                onChange={(e) => setDraft({ ...draft, ai_prompt_template: e.target.value })}
                className="mt-4 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 font-mono text-sm text-white outline-none focus:border-emerald-500"
              />
            </section>
          ) : null}

          {tab === 'notifications' ? (
            <section className="space-y-4">
              {(
                [
                  ['issue_status_changed', 'Issue status changed'],
                  ['task_assigned', 'Task assigned to worker'],
                  ['issue_resolved', 'Issue resolved']
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
                  <label className="block text-sm font-medium text-slate-300">
                    {label}
                    <textarea
                      rows={3}
                      value={draft.notification_templates[key]}
                      onChange={(e) => updateTemplates(key, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    Placeholders: {'{reference}'}, {'{title}'}, {'{status}'}, {'{worker_name}'}
                  </p>
                </div>
              ))}
            </section>
          ) : null}

          {tab === 'districts' ? (
            <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Rwanda Districts
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Used in citizen report forms and admin filters.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  placeholder="Add district..."
                  className="flex-1 rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={addDistrict}
                  className="rounded-lg border border-cir-border-subtle px-4 py-2 text-sm text-slate-300 hover:text-white"
                >
                  Add
                </button>
              </div>
              <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto">
                {draft.districts.map((district) => (
                  <li
                    key={district}
                    className="flex items-center justify-between rounded-lg bg-cir-bg/50 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-200">{district}</span>
                    <button
                      type="button"
                      onClick={() => removeDistrict(district)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>
          ) : null}

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save settings'}
          </button>
        </form>
      </div>
    </div>
  )
}
