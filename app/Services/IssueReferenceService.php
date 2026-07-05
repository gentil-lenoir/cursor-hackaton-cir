<?php

namespace App\Services;

use App\Models\Issue;
use Illuminate\Support\Facades\DB;

class IssueReferenceService
{
    public function generate(): string
    {
        return DB::transaction(function (): string {
            $year = now()->year;
            $prefix = "CIR-{$year}-";

            $lastIssue = Issue::query()
                ->where('reference_number', 'like', $prefix.'%')
                ->lockForUpdate()
                ->orderByDesc('reference_number')
                ->first();

            $nextNumber = 1;

            if ($lastIssue !== null) {
                $nextNumber = (int) substr($lastIssue->reference_number, -5) + 1;
            }

            return sprintf('%s%05d', $prefix, $nextNumber);
        });
    }
}
