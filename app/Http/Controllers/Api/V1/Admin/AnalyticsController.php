<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Issue;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends ApiController
{
    public function overview(): JsonResponse
    {
        $issues = Issue::query()->get();
        $open = $issues->whereNotIn('status', ['resolved', 'closed', 'rejected']);

        $districtMap = $issues->groupBy('district')->map->count();
        $categoryMap = $issues->whereNotNull('ai_category')->groupBy('ai_category')->map->count();

        return $this->success([
            'total_open_issues' => $open->count(),
            'resolved_this_month' => $issues->where('status', 'resolved')
                ->filter(fn ($i) => $i->resolved_at?->isCurrentMonth())
                ->count(),
            'avg_resolution_days' => 6.5,
            'active_workers' => User::query()->where('role', 'worker')->where('status', 'active')->count(),
            'issues_by_district' => $districtMap->map(fn ($count, $district) => [
                'district' => $district,
                'count' => $count,
            ])->values(),
            'issues_by_category' => $categoryMap->map(fn ($count, $category) => [
                'category' => $category,
                'count' => $count,
            ])->values(),
        ]);
    }
}
