<?php

namespace App\Services;

use App\Models\Issue;

class PriorityService
{
    public function computeFinalPriority(Issue $issue): float
    {
        if ($issue->admin_priority_override !== null) {
            return (float) $issue->admin_priority_override;
        }

        $citizenPriority = (float) $issue->citizen_priority;
        $aiPriority = $issue->ai_priority !== null ? (float) $issue->ai_priority : $citizenPriority;
        $communityNormalized = $this->normalizeCommunityScore($issue->community_score);

        $final = round(
            0.30 * $citizenPriority +
            0.40 * $aiPriority +
            0.30 * $communityNormalized,
            1
        );

        return max(1.0, min(5.0, $final));
    }

    private function normalizeCommunityScore(int $communityScore, int $maxScore = 50): float
    {
        if ($maxScore <= 0) {
            return 0.0;
        }

        $normalized = (($communityScore + $maxScore) / (2 * $maxScore)) * 5;

        return max(0.0, min(5.0, $normalized));
    }
}
