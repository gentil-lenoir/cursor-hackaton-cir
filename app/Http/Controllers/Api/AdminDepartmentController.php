<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDepartmentRequest;
use App\Http\Requests\Api\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AdminDepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $departments = Department::query()
                ->withCount('workers')
                ->orderBy('name')
                ->get()
                ->map(fn (Department $department) => $this->formatDepartment($department));

            return response()->json([
                'message' => 'Departments fetched successfully.',
                'data' => $departments,
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to fetch departments.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $department = Department::query()->create([
                'name' => $validated['name'],
                'code' => $this->uniqueCode($validated['name']),
                'description' => $validated['description'] ?? null,
            ]);

            return response()->json([
                'message' => 'Department created successfully.',
                'data' => $this->formatDepartment($department),
            ], 201);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to create department.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        try {
            $validated = $request->validated();

            $department->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            return response()->json([
                'message' => 'Department updated successfully.',
                'data' => $this->formatDepartment($department->fresh()->loadCount('workers')),
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to update department.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function destroy(Department $department): JsonResponse
    {
        try {
            if ($department->workers()->exists()) {
                throw ValidationException::withMessages([
                    'department' => 'Move or remove workers from this department before deleting it.',
                ]);
            }

            $department->delete();

            return response()->json([
                'message' => 'Department deleted successfully.',
            ]);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to delete department.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    private function formatDepartment(Department $department): array
    {
        return [
            'id' => $department->id,
            'name' => $department->name,
            'code' => $department->code,
            'description' => $department->description,
            'workers_count' => $department->workers_count ?? $department->workers()->count(),
            'created_at' => $department->created_at,
            'updated_at' => $department->updated_at,
        ];
    }

    private function uniqueCode(string $name): string
    {
        $base = Str::upper(Str::substr(Str::slug($name, ''), 0, 8));
        $code = $base !== '' ? $base : 'DEPT';
        $counter = 1;

        while (Department::query()->where('code', $code)->exists()) {
            $code = Str::substr($base, 0, 5).str_pad((string) $counter, 3, '0', STR_PAD_LEFT);
            $counter++;
        }

        return $code;
    }
}
