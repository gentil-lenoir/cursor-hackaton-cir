<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreWorkerRequest;
use App\Http\Requests\Api\UpdateWorkerRequest;
use App\Models\Department;
use App\Models\Worker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class AdminWorkerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = max(1, min((int) $request->integer('limit', 10), 100));
            $sort = $request->string('sort')->toString();

            $query = Worker::query()
                ->with('department')
                ->withCount('issues')
                ->when($request->filled('department'), fn ($builder) => $builder->where('department_id', $request->integer('department')))
                ->when($request->filled('status'), fn ($builder) => $builder->where('status', $request->string('status')))
                ->when($request->filled('search'), function ($builder) use ($request) {
                    $term = $request->string('search');

                    $builder->where(function ($nestedQuery) use ($term): void {
                        $nestedQuery
                            ->where('name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%")
                            ->orWhere('phone', 'like', "%{$term}%");
                    });
                });

            if ($sort === 'issues_count') {
                $query->orderByDesc('issues_count');
            } else {
                $query->latest();
            }

            $workers = $query->paginate($perPage);

            return response()->json([
                'message' => 'Workers fetched successfully.',
                'data' => collect($workers->items())->map(fn (Worker $worker) => $this->formatWorker($worker))->values(),
                'meta' => [
                    'total' => $workers->total(),
                    'current_page' => $workers->currentPage(),
                    'per_page' => $workers->perPage(),
                    'last_page' => $workers->lastPage(),
                ],
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to fetch workers.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function stats(): JsonResponse
    {
        try {
            return response()->json([
                'message' => 'Admin stats fetched successfully.',
                'data' => [
                    'workers' => Worker::query()->count(),
                    'active_workers' => Worker::query()->where('status', Worker::STATUS_ACTIVE)->count(),
                    'departments' => Department::query()->count(),
                ],
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to fetch admin stats.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function store(StoreWorkerRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $validated['password'] = $validated['password'] ?? Str::password(16);
            $validated['status'] = $validated['status'] ?? Worker::STATUS_ACTIVE;
            $validated['availability_status'] = $validated['availability_status'] ?? 'available';
            $validated['theme_preference'] = $validated['theme_preference'] ?? 'light';

            $worker = Worker::query()->create($validated);
            $worker->load('department')->loadCount('issues');

            return response()->json([
                'message' => 'Worker created successfully.',
                'data' => $this->formatWorker($worker),
            ], 201);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to create worker.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateWorkerRequest $request, Worker $worker): JsonResponse
    {
        try {
            $validated = $request->validated();

            if (blank($validated['password'] ?? null)) {
                unset($validated['password']);
            }

            $worker->update($validated);
            $worker->load('department')->loadCount('issues');

            return response()->json([
                'message' => 'Worker updated successfully.',
                'data' => $this->formatWorker($worker),
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to update worker.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function destroy(Worker $worker): JsonResponse
    {
        try {
            DB::transaction(function () use ($worker): void {
                $worker->issues()->update([
                    'worker_id' => null,
                    'deadline' => null,
                    'status' => 'reported',
                ]);

                $worker->delete();
            });

            return response()->json([
                'message' => 'Worker deleted successfully.',
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to delete worker.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function toggleStatus(Worker $worker): JsonResponse
    {
        try {
            $newStatus = $worker->status === Worker::STATUS_ACTIVE
                ? Worker::STATUS_INACTIVE
                : Worker::STATUS_ACTIVE;

            $worker->update(['status' => $newStatus]);
            $worker->load('department')->loadCount('issues');

            return response()->json([
                'message' => 'Worker status updated successfully.',
                'data' => [
                    'status' => $newStatus,
                    'worker' => $this->formatWorker($worker),
                ],
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to update worker status.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    private function formatWorker(Worker $worker): array
    {
        return [
            'id' => $worker->id,
            'name' => $worker->name,
            'email' => $worker->email,
            'phone' => $worker->phone,
            'department_id' => $worker->department_id,
            'department_name' => $worker->department?->name,
            'status' => $worker->status,
            'availability_status' => $worker->availability_status,
            'theme_preference' => $worker->theme_preference,
            'preferred_zone' => $worker->preferred_zone,
            'shift_window' => $worker->shift_window,
            'issues_count' => $worker->issues_count ?? $worker->issues()->count(),
            'created_at' => $worker->created_at,
            'updated_at' => $worker->updated_at,
        ];
    }
}
