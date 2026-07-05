<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends ApiController
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Incorrect email or password.'],
            ]);
        }

        if ($user->role !== 'admin') {
            return $this->error('Only admin accounts can use this login.', 403);
        }

        $token = $user->createToken('admin-desktop')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function requestOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $user = User::query()->where('phone', $data['phone'])->where('role', 'admin')->first();

        if (! $user) {
            return $this->error('Phone number not registered as admin.', 422);
        }

        $code = app()->environment('local') ? '123456' : (string) random_int(100000, 999999);
        Cache::put('otp:'.$data['phone'], $code, now()->addMinutes(5));

        return $this->success(['sent' => true], 'OTP sent.');
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string'],
            'code' => ['required', 'string'],
        ]);

        $cached = Cache::get('otp:'.$data['phone']);

        if (! $cached || $cached !== $data['code']) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired OTP code.'],
            ]);
        }

        $user = User::query()->where('phone', $data['phone'])->where('role', 'admin')->first();

        if (! $user) {
            return $this->error('Admin account not found.', 404);
        }

        Cache::forget('otp:'.$data['phone']);
        $token = $user->createToken('admin-desktop')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success($this->formatUser($request->user()));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(null, 'Logged out.');
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'language' => $user->language,
        ];
    }
}
