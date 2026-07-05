<?php

namespace App\Http\Requests\Auth;

use App\Rules\RwandaPhone;
use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', new RwandaPhone],
            'code' => ['required', 'string', 'digits:6'],
            'client' => ['sometimes', 'string', 'in:citizen-web,citizen-mobile,worker-mobile,admin-desktop'],
        ];
    }
}
