import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  approveFlaggedComment,
  banCommentAuthor,
  deleteFlaggedComment,
  fetchFlaggedComments
} from '@/api/client'
import { EmptyState, PageHeader } from '@/components/ui'

export function ModerationPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['moderation-comments'],
    queryFn: fetchFlaggedComments
  })

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['moderation-comments'] })

  const approveMutation = useMutation({
    mutationFn: approveFlaggedComment,
    onSuccess: invalidate
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFlaggedComment,
    onSuccess: invalidate
  })

  const banMutation = useMutation({
    mutationFn: banCommentAuthor,
    onSuccess: invalidate
  })

  const comments = data ?? []
  const isBusy =
    approveMutation.isPending || deleteMutation.isPending || banMutation.isPending

  return (
    <div>
      <PageHeader
        title="Comment Moderation"
        description="Review flagged public comments. Approve to dismiss flags, delete harmful content, or ban repeat offenders."
      />

      <div className="px-8 py-6">
        {isLoading ? (
          <EmptyState title="Loading queue..." description="Fetching flagged comments." />
        ) : isError ? (
          <EmptyState title="Could not load moderation queue" description="Check your API connection." />
        ) : comments.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            description="No flagged comments need review right now."
          />
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-xl border border-cir-border bg-cir-surface/60 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/inbox/${comment.issue_id}`}
                      className="font-mono text-sm text-emerald-300 hover:underline"
                    >
                      {comment.issue_reference}
                    </Link>
                    <p className="mt-1 text-sm text-slate-400">{comment.issue_title}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-300">
                      {comment.flagged_count} flags
                    </span>
                    {!comment.is_visible ? (
                      <span className="rounded-full bg-cir-elevated/60 px-2.5 py-0.5 text-xs text-slate-300">
                        Hidden
                      </span>
                    ) : null}
                    {comment.comment_banned ? (
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs text-amber-300">
                        Author banned
                      </span>
                    ) : null}
                  </div>
                </div>

                <blockquote className="mt-4 rounded-lg border border-cir-border-subtle/50 bg-cir-bg/50 px-4 py-3 text-sm text-slate-200">
                  {comment.body}
                </blockquote>

                <p className="mt-3 text-xs text-slate-500">
                  {comment.author_name} · user #{comment.user_id} ·{' '}
                  {new Date(comment.created_at).toLocaleString()}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => approveMutation.mutate(comment.id)}
                    className="rounded-lg border border-emerald-600/50 bg-emerald-600/10 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-600/20 disabled:opacity-60"
                  >
                    Approve / Dismiss flags
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      if (window.confirm('Delete this comment permanently?')) {
                        deleteMutation.mutate(comment.id)
                      }
                    }}
                    className="rounded-lg border border-red-600/50 bg-red-600/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-600/20 disabled:opacity-60"
                  >
                    Delete comment
                  </button>
                  <button
                    type="button"
                    disabled={isBusy || comment.comment_banned}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Ban ${comment.author_name} from commenting on public issues?`
                        )
                      ) {
                        banMutation.mutate(comment.user_id)
                      }
                    }}
                    className="rounded-lg border border-amber-600/50 bg-amber-600/10 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-600/20 disabled:opacity-60"
                  >
                    Ban from commenting
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
