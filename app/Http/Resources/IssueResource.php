<?php

namespace App\Http\Resources;

use App\Models\Issue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Issue */
class IssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'reporter_name' => $this->when(! $this->is_anonymous, $this->reporter_name),
            'is_anonymous' => $this->is_anonymous,
            'title' => $this->title,
            'description' => $this->description,
            'district' => $this->district,
            'sector' => $this->sector,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status?->value ?? $this->status,
            'citizen_priority' => $this->citizen_priority,
            'community_score' => $this->community_score,
            'final_priority' => (float) $this->final_priority,
            'is_public' => $this->is_public,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
