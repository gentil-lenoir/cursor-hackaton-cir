import { useQuery } from '@tanstack/react-query'
import { fetchAnalyticsOverview } from '@/api/client'
import { EmptyState, PageHeader } from '@/components/ui'

export function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: fetchAnalyticsOverview
  })

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        description="Overview of issue volume, resolution, and worker capacity."
      />

      <div className="space-y-6 px-8 py-6">
        {isLoading ? (
          <EmptyState title="Loading analytics..." description="Computing KPIs from issue data." />
        ) : isError || !data ? (
          <EmptyState title="Could not load analytics" description="Check your connection and ensure the Laravel API is running." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Open Issues', value: data.total_open_issues },
                { label: 'Resolved This Month', value: data.resolved_this_month },
                { label: 'Avg Resolution (days)', value: data.avg_resolution_days },
                { label: 'Active Workers', value: data.active_workers }
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-cir-border bg-cir-surface/60 p-5"
                >
                  <p className="text-sm text-slate-400">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                  Issues by District
                </h3>
                <div className="space-y-3">
                  {data.issues_by_district.map((row) => (
                    <div key={row.district}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-300">{row.district}</span>
                        <span className="text-white">{row.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-cir-border">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, row.count * 20)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-cir-border bg-cir-surface/60 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                  Issues by Category
                </h3>
                <div className="space-y-2">
                  {data.issues_by_category.map((row) => (
                    <div
                      key={row.category}
                      className="flex items-center justify-between rounded-lg bg-cir-bg/50 px-3 py-2 text-sm"
                    >
                      <span className="capitalize text-slate-300">{row.category}</span>
                      <span className="font-medium text-white">{row.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
