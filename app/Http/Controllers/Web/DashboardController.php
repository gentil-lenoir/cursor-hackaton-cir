<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();
        $issueCount = $user?->issues()->count() ?? 0;

        return Inertia::render('Dashboard', [
            'issueCount' => $issueCount,
        ]);
    }
}
