<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Issue;
use App\Models\IssueActivityLog;
use App\Models\Task;
use App\Models\TaskStep;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends ApiController
{
    public function index(): JsonResponse
    {
        $tasks = Task::query()
            ->with(['issue', 'assignee'])
            ->latest()
            ->get()
            ->map(fn (Task $task) => $this->formatTask($task));

        return $this->success($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'issue_id' => ['required', 'integer', 'exists:issues,id'],
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
            'due_date' => ['nullable', 'date'],
            'admin_notes' => ['nullable', 'string'],
            'steps' => ['nullable', 'array'],
            'steps.*' => ['string'],
        ]);

        $issue = Issue::query()->findOrFail($data['issue_id']);
        $worker = User::query()->where('id', $data['assigned_to'])->where('role', 'worker')->where('status', 'active')->first();

        if (! $worker) {
            return $this->error('Worker not found or not active.', 422);
        }

        $task = Task::query()->create([
            'issue_id' => $issue->id,
            'assigned_to' => $worker->id,
            'assigned_by' => $request->user()->id,
            'title' => 'Task for '.$issue->reference_number,
            'admin_notes' => $data['admin_notes'] ?? null,
            'status' => 'todo',
            'due_date' => $data['due_date'] ?? null,
        ]);

        foreach ($data['steps'] ?? [] as $index => $stepTitle) {
            TaskStep::query()->create([
                'task_id' => $task->id,
                'title' => $stepTitle,
                'order' => $index + 1,
                'added_by' => 'admin',
            ]);
        }

        $issue->update(['status' => 'assigned']);

        IssueActivityLog::query()->create([
            'issue_id' => $issue->id,
            'user_id' => $request->user()->id,
            'action' => 'Task assigned to '.$worker->name,
            'metadata' => ['task_id' => $task->id, 'worker_id' => $worker->id],
        ]);

        return $this->success($this->formatTask($task->load(['issue', 'assignee'])), 'Task created.', 201);
    }

    private function formatTask(Task $task): array
    {
        return [
            'id' => $task->id,
            'issue_id' => $task->issue_id,
            'issue_title' => $task->issue->title,
            'issue_reference' => $task->issue->reference_number,
            'district' => $task->issue->district,
            'assigned_to' => $task->assigned_to,
            'assigned_to_name' => $task->assignee->name,
            'title' => $task->title,
            'admin_notes' => $task->admin_notes,
            'status' => $task->status,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'created_at' => $task->created_at?->toIso8601String(),
            'updated_at' => $task->updated_at?->toIso8601String(),
        ];
    }
}
