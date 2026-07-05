<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssueReaction extends Model
{
    public const REACTION_LIKE = 'like';

    public const REACTION_DISLIKE = 'dislike';

    protected $fillable = [
        'issue_id',
        'user_id',
        'reaction',
    ];

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
