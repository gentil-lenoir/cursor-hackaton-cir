<?php

namespace App\Enums;

enum IssueStatus: string
{
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';
    case Rejected = 'rejected';
}
