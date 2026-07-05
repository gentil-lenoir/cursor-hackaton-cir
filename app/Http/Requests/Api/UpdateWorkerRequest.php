<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWorkerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $workerId = $this->route('worker')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('workers', 'email')->ignore($workerId)],
            'phone' => ['nullable', 'string', 'max:25'],
            'department_id' => ['sometimes', 'required', 'exists:departments,id'],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive'])],
            'availability_status' => ['sometimes', 'required', Rule::in(['available', 'busy', 'offline'])],
            'theme_preference' => ['sometimes', 'required', Rule::in(['light', 'dark'])],
            'preferred_zone' => ['nullable', 'string', 'max:255'],
            'shift_window' => ['nullable', 'string', 'max:255'],
        ];
    }
}
