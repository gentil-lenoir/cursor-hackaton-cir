<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    protected $fillable = [
        'issue_id',
        'assigned_to',
        'assigned_by',
        'title',
        'admin_notes',
        'status',
        'due_date',
    ];

    protected function casts(): array
    {
        return ['due_date' => 'date'];
    }

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(TaskStep::class)->orderBy('order');
    }
}
