<?php

namespace App\Models;

use App\Enums\IssueStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Issue extends Model
{
    protected $fillable = [
        'reference_number',
        'user_id',
        'reporter_name',
        'is_anonymous',
        'title',
        'description',
        'district',
        'sector',
        'latitude',
        'longitude',
        'status',
        'citizen_priority',
        'ai_priority',
        'ai_category',
        'ai_summary',
        'ai_tags',
        'ai_confidence',
        'community_score',
        'final_priority',
        'admin_priority_override',
        'duplicate_of_id',
        'is_public',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
            'is_public' => 'boolean',
            'status' => IssueStatus::class,
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'ai_tags' => 'array',
            'ai_confidence' => 'decimal:2',
            'final_priority' => 'decimal:1',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function duplicateOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'duplicate_of_id');
    }
}
