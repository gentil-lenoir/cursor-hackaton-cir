<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\ApiController as BaseApiController;
use App\Models\Issue;
use Illuminate\Http\JsonResponse;

class IssueCommentController extends BaseApiController
{
    public function index(Issue $issue): JsonResponse
    {
        $comments = $issue->comments()
            ->where('is_visible', true)
            ->latest()
            ->get()
            ->map(fn ($comment) => [
                'id' => $comment->id,
                'user_id' => $comment->user_id,
                'body' => $comment->body,
                'created_at' => $comment->created_at?->toIso8601String(),
            ]);

        return $this->success($comments);
    }
}
