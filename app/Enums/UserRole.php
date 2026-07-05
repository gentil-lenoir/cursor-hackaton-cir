<?php

namespace App\Enums;

enum UserRole: string
{
    case Citizen = 'citizen';
    case Worker = 'worker';
    case Admin = 'admin';
}
