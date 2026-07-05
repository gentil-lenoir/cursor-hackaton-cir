<?php

namespace App\Http\Requests\Auth;

use App\Rules\RwandaPhone;
use Illuminate\Foundation\Http\FormRequest;

class RequestOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', new RwandaPhone],
        ];
    }
}
