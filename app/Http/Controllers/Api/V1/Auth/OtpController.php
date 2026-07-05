<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RequestOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class OtpController extends Controller
{
    public function __construct(private readonly OtpService $otpService) {}

    public function request(RequestOtpRequest $request): JsonResponse
    {
        try {
            $this->otpService->request($request->validated('phone'));
        } catch (RuntimeException $exception) {
            if ($exception->getCode() === 429) {
                return response()->json([
                    'message' => $exception->getMessage(),
                ], 429);
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'OTP sent successfully.',
        ]);
    }

    public function verify(VerifyOtpRequest $request): JsonResponse
    {
        $data = $request->validated();
        $phone = $data['phone'];
        $code = $data['code'];
        $client = $data['client'] ?? 'citizen-mobile';

        if (! $this->otpService->verify($phone, $code)) {
            return response()->json([
                'message' => 'Invalid or expired OTP code.',
            ], 422);
        }

        $user = User::query()->where('phone', $phone)->first();

        if ($user === null) {
            $user = User::query()->create([
                'phone' => $phone,
                'name' => 'Citizen',
                'role' => 'citizen',
                'status' => 'active',
                'language' => 'en',
            ]);
        } elseif (! $user->isActive()) {
            return response()->json([
                'message' => 'This account is not active.',
            ], 403);
        }

        $tokenName = $client;
        $ttlDays = config("cir.token_ttl_days.{$tokenName}", 30);

        $token = $user->createToken($tokenName, ['*'], now()->addDays($ttlDays))->plainTextToken;

        if ($client === 'citizen-web') {
            Auth::login($user);

            if ($request->hasSession()) {
                $request->session()->regenerate();
            }
        }

        return response()->json([
            'message' => 'Authentication successful.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }
}
