<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\IssueStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIssueRequest;
use App\Http\Resources\IssueResource;
use App\Models\Issue;
use App\Services\IssueReferenceService;
use App\Services\PriorityService;
use Illuminate\Http\JsonResponse;

class IssueController extends Controller
{
    public function __construct(
        private readonly IssueReferenceService $referenceService,
        private readonly PriorityService $priorityService,
    ) {}

    public function store(StoreIssueRequest $request): JsonResponse
    {
        $data = $request->validated();

        $issue = new Issue([
            'reference_number' => $this->referenceService->generate(),
            'user_id' => $request->user()->id,
            'reporter_name' => $data['reporter_name'],
            'is_anonymous' => $data['is_anonymous'] ?? false,
            'title' => $data['title'],
            'description' => $data['description'],
            'district' => $data['district'],
            'sector' => $data['sector'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'status' => IssueStatus::Submitted,
            'citizen_priority' => $data['citizen_priority'],
            'community_score' => 0,
            'is_public' => true,
        ]);

        $issue->final_priority = $this->priorityService->computeFinalPriority($issue);
        $issue->save();

        return response()->json([
            'message' => 'Issue submitted successfully.',
            'issue' => new IssueResource($issue),
        ], 201);
    }
}
