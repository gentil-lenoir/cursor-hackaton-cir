<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Issue;
use App\Models\IssueActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssueController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Issue::query()->orderByDesc('final_priority');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($district = $request->string('district')->toString()) {
            $query->where('district', 'like', "%{$district}%");
        }

        $issues = $query->get()->map(fn (Issue $issue) => $this->formatIssue($issue));

        return $this->success($issues);
    }

    public function show(Issue $issue): JsonResponse
    {
        return $this->success($this->formatIssue($issue));
    }

    public function update(Request $request, Issue $issue): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'string'],
            'admin_priority_override' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
        ]);

        if (array_key_exists('status', $data) && $data['status'] !== $issue->status) {
            IssueActivityLog::query()->create([
                'issue_id' => $issue->id,
                'user_id' => $request->user()->id,
                'action' => 'Status changed to '.$data['status'],
                'metadata' => ['from' => $issue->status, 'to' => $data['status']],
            ]);
            $issue->status = $data['status'];
            if ($data['status'] === 'resolved') {
                $issue->resolved_at = now();
            }
        }

        if (array_key_exists('admin_priority_override', $data)) {
            $issue->admin_priority_override = $data['admin_priority_override'];
            $issue->final_priority = $data['admin_priority_override'] ?? $issue->final_priority;
            IssueActivityLog::query()->create([
                'issue_id' => $issue->id,
                'user_id' => $request->user()->id,
                'action' => 'Priority override set to '.$data['admin_priority_override'],
                'metadata' => ['admin_priority_override' => $data['admin_priority_override']],
            ]);
        }

        $issue->save();

        return $this->success($this->formatIssue($issue->fresh()));
    }

    public function activity(Issue $issue): JsonResponse
    {
        $logs = $issue->activityLogs()->orderByDesc('created_at')->get()->map(fn ($log) => [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'action' => $log->action,
            'metadata' => $log->metadata,
            'created_at' => $log->created_at?->toIso8601String(),
        ]);

        return $this->success($logs);
    }

    private function formatIssue(Issue $issue): array
    {
        return [
            'id' => $issue->id,
            'reference_number' => $issue->reference_number,
            'reporter_name' => $issue->is_anonymous ? 'Anonymous Citizen' : $issue->reporter_name,
            'title' => $issue->title,
            'description' => $issue->description,
            'district' => $issue->district,
            'sector' => $issue->sector,
            'latitude' => $issue->latitude ? (float) $issue->latitude : null,
            'longitude' => $issue->longitude ? (float) $issue->longitude : null,
            'status' => $issue->status,
            'citizen_priority' => $issue->citizen_priority,
            'ai_priority' => $issue->ai_priority,
            'ai_category' => $issue->ai_category,
            'ai_summary' => $issue->ai_summary,
            'ai_tags' => $issue->ai_tags,
            'ai_confidence' => $issue->ai_confidence ? (float) $issue->ai_confidence : null,
            'community_score' => $issue->community_score,
            'final_priority' => (float) $issue->final_priority,
            'admin_priority_override' => $issue->admin_priority_override,
            'resolved_at' => $issue->resolved_at?->toIso8601String(),
            'created_at' => $issue->created_at?->toIso8601String(),
            'updated_at' => $issue->updated_at?->toIso8601String(),
        ];
    }
}
