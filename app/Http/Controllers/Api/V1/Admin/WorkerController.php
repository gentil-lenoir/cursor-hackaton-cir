<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class WorkerController extends ApiController
{
    public function index(): JsonResponse
    {
        $workers = User::query()
            ->where('role', 'worker')
            ->orderBy('name')
            ->get()
            ->map(function (User $worker) {
                $activeCount = Task::query()
                    ->where('assigned_to', $worker->id)
                    ->whereNotIn('status', ['done'])
                    ->count();

                return [
                    'id' => $worker->id,
                    'name' => $worker->name,
                    'phone' => $worker->phone,
                    'status' => $worker->status,
                    'active_task_count' => $activeCount,
                ];
            });

        return $this->success($workers);
    }
}
