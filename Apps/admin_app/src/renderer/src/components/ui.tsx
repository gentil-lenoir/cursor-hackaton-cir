import { ISSUE_STATUS_LABELS, PRIORITY_COLORS, type IssueStatus } from '@/types'

export function PriorityBadge({ priority }: { priority: number | null }) {
  if (priority == null) {
    return <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">N/A</span>
  }

  const rounded = Math.max(1, Math.min(5, Math.round(priority)))
  const color = PRIORITY_COLORS[rounded] ?? 'bg-slate-500'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${color}`}>
      P{rounded}
    </span>
  )
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  const styles: Record<IssueStatus, string> = {
    submitted: 'bg-blue-500/20 text-blue-300',
    under_review: 'bg-violet-500/20 text-violet-300',
    assigned: 'bg-cyan-500/20 text-cyan-300',
    in_progress: 'bg-amber-500/20 text-amber-300',
    resolved: 'bg-emerald-500/20 text-emerald-300',
    closed: 'bg-slate-500/20 text-slate-300',
    rejected: 'bg-red-500/20 text-red-300'
  }

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {ISSUE_STATUS_LABELS[status]}
    </span>
  )
}

export function PageHeader({
  title,
  description,
  actions
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-8 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  )
}
