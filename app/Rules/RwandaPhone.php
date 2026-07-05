<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RwandaPhone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match(config('cir.phone_regex'), $value)) {
            $fail('The :attribute must be a valid Rwanda phone number (+250 followed by 9 digits).');
        }
    }
}
