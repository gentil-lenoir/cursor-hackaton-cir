import { EmptyState, PageHeader } from '@/components/ui'

export function PlaceholderPage({
  title,
  description
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="px-8 py-6">
        <EmptyState
          title="Coming soon"
          description="This section will be implemented in the next phase of the admin app."
        />
      </div>
    </div>
  )
}
