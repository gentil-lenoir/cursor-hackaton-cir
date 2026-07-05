<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\IssueResource;
use App\Models\Issue;
use App\Models\Worker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class AdminIssueController extends Controller
{
    public function show(Issue $issue): JsonResponse
    {
        try {
            $issue->load([
                'user',
                'images',
                'worker.department',
                'assignment.worker',
                'assignment.assignedBy',
                'escalatedTo',
            ])->loadCount('comments');

            return response()->json([
                'message' => 'Issue fetched successfully.',
                'data' => new IssueResource($issue),
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to fetch issue.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function assign(Request $request, Issue $issue): JsonResponse
    {
        try {
            $validated = $request->validate([
                'worker_id' => [
                    'required',
                    'exists:workers,id',
                    Rule::exists('workers', 'id')->where(fn ($query) => $query->where('status', Worker::STATUS_ACTIVE)),
                ],
                'deadline' => ['required', 'date', 'after_or_equal:today'],
                'status' => ['nullable', Rule::in(['reported', 'in_progress', 'resolved'])],
                'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            ]);

            $worker = Worker::query()->findOrFail($validated['worker_id']);

            $updates = [
                'worker_id' => $worker->id,
                'deadline' => $request->date('deadline')?->toDateString(),
                'status' => $validated['status'] ?? 'in_progress',
            ];

            if (array_key_exists('priority', $validated)) {
                $updates['priority'] = $validated['priority'];
            }

            $issue->update($updates);

            $issue->load([
                'user',
                'images',
                'worker.department',
                'assignment.worker',
                'assignment.assignedBy',
                'escalatedTo',
            ])->loadCount('comments');

            return response()->json([
                'message' => 'Issue assigned successfully.',
                'data' => new IssueResource($issue),
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to assign issue.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }
}
