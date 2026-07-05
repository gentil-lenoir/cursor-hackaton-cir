<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueReaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Throwable;

class IssueReactionController extends Controller
{
    public function store(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reaction' => ['required', Rule::in([
                    IssueReaction::REACTION_LIKE,
                    IssueReaction::REACTION_DISLIKE,
                ])],
            ]);

            $issue = Issue::findOrFail($id);
            $reactionType = $validated['reaction'];

            $existing = IssueReaction::query()
                ->where('issue_id', $issue->id)
                ->where('user_id', $request->user()->id)
                ->first();

            $message = 'Reaction saved successfully.';

            DB::transaction(function () use ($issue, $request, $existing, $reactionType, &$message): void {
                if ($existing) {
                    if ($existing->reaction === $reactionType) {
                        $this->decrementCount($issue, $existing->reaction);
                        $existing->delete();
                        $message = 'Reaction removed.';

                        return;
                    }

                    $this->decrementCount($issue, $existing->reaction);
                    $existing->update(['reaction' => $reactionType]);
                    $this->incrementCount($issue, $reactionType);
                    $message = 'Reaction updated successfully.';

                    return;
                }

                IssueReaction::create([
                    'issue_id' => $issue->id,
                    'user_id' => $request->user()->id,
                    'reaction' => $reactionType,
                ]);

                $this->incrementCount($issue, $reactionType);
            });

            $issue->refresh();

            return response()->json([
                'message' => $message,
                'data' => [
                    'likes_count' => $issue->likes_count,
                    'dislikes_count' => $issue->dislikes_count,
                    'user_reaction' => IssueReaction::query()
                        ->where('issue_id', $issue->id)
                        ->where('user_id', $request->user()->id)
                        ->value('reaction'),
                ],
            ], 201);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to save reaction.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    private function incrementCount(Issue $issue, string $reaction): void
    {
        if ($reaction === IssueReaction::REACTION_LIKE) {
            $issue->increment('likes_count');

            return;
        }

        $issue->increment('dislikes_count');
    }

    private function decrementCount(Issue $issue, string $reaction): void
    {
        if ($reaction === IssueReaction::REACTION_LIKE) {
            $issue->decrement('likes_count');

            return;
        }

        $issue->decrement('dislikes_count');
    }
}
