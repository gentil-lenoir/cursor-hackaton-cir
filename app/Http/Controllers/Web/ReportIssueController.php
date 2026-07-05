<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\District;
use Inertia\Inertia;
use Inertia\Response;

class ReportIssueController extends Controller
{
    public function __invoke(): Response
    {
        $districts = District::query()
            ->orderBy('province')
            ->orderBy('name')
            ->get(['id', 'name', 'province'])
            ->map(fn (District $district) => [
                'id' => $district->id,
                'name' => $district->name,
                'province' => $district->province,
            ]);

        return Inertia::render('ReportIssue', [
            'districts' => $districts,
        ]);
    }
}
