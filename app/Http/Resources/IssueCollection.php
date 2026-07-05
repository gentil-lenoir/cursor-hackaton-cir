<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class IssueCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => IssueResource::collection($this->collection),
        ];
    }

    public function with(Request $request): array
    {
        if (method_exists($this->resource, 'total')) {
            return [
                'meta' => [
                    'total' => $this->resource->total(),
                    'current_page' => $this->resource->currentPage(),
                    'last_page' => $this->resource->lastPage(),
                    'per_page' => $this->resource->perPage(),
                ],
            ];
        }

        return [
            'meta' => [
                'total' => $this->collection->count(),
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $this->collection->count(),
            ],
        ];
    }
}
