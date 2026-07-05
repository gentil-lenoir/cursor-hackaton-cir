<?php

namespace App\Services;

use App\Models\OtpCode;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use RuntimeException;

class OtpService
{
    private int $ttl;

    private int $rateLimit;

    private int $rateWindow;

    private int $maxAttempts;

    private bool $devLog;

    public function __construct()
    {
        $this->ttl = config('cir.otp.ttl', 300);
        $this->rateLimit = config('cir.otp.rate_limit', 3);
        $this->rateWindow = config('cir.otp.rate_window', 900);
        $this->maxAttempts = config('cir.otp.max_attempts', 5);
        $this->devLog = (bool) config('cir.otp.dev_log', true);
    }

    public function request(string $phone): void
    {
        $rateKey = 'otp-request:'.$phone;

        if (RateLimiter::tooManyAttempts($rateKey, $this->rateLimit)) {
            $seconds = RateLimiter::availableIn($rateKey);

            throw new RuntimeException("Too many OTP requests. Try again in {$seconds} seconds.", 429);
        }

        RateLimiter::hit($rateKey, $this->rateWindow);

        $code = $this->generateCode();

        $this->store($phone, $code);
        $this->deliver($phone, $code);
    }

    public function verify(string $phone, string $code): bool
    {
        $payload = $this->retrieve($phone);

        if ($payload === null) {
            return false;
        }

        if (($payload['attempts'] ?? 0) >= $this->maxAttempts) {
            $this->forget($phone);

            return false;
        }

        if ($payload['code'] !== $code) {
            $payload['attempts'] = ($payload['attempts'] ?? 0) + 1;
            $this->storePayload($phone, $payload);

            return false;
        }

        $this->forget($phone);
        $this->markVerified($phone, $code);

        return true;
    }

    private function store(string $phone, string $code): void
    {
        $payload = [
            'code' => $code,
            'attempts' => 0,
            'expires_at' => now()->addSeconds($this->ttl)->timestamp,
        ];

        $this->storePayload($phone, $payload);

        OtpCode::create([
            'phone' => $phone,
            'code' => $code,
            'expires_at' => now()->addSeconds($this->ttl),
            'verified' => false,
            'attempts' => 0,
        ]);
    }

    private function storePayload(string $phone, array $payload): void
    {
        Cache::put($this->cacheKey($phone), $payload, $this->ttl);
    }

    private function retrieve(string $phone): ?array
    {
        $payload = Cache::get($this->cacheKey($phone));

        if (! is_array($payload)) {
            return null;
        }

        if (($payload['expires_at'] ?? 0) < now()->timestamp) {
            $this->forget($phone);

            return null;
        }

        return $payload;
    }

    private function forget(string $phone): void
    {
        Cache::forget($this->cacheKey($phone));
    }

    private function cacheKey(string $phone): string
    {
        return 'otp:'.$phone;
    }

    private function markVerified(string $phone, string $code): void
    {
        OtpCode::query()
            ->where('phone', $phone)
            ->where('code', $code)
            ->where('verified', false)
            ->latest()
            ->limit(1)
            ->update(['verified' => true]);
    }

    private function generateCode(): string
    {
        $fixed = config('cir.otp.fixed_code');

        if (is_string($fixed) && $fixed !== '') {
            return str_pad($fixed, 6, '0', STR_PAD_LEFT);
        }

        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function deliver(string $phone, string $code): void
    {
        if ($this->devLog || app()->environment('local', 'testing')) {
            Log::info('CIR OTP code generated', [
                'phone' => $phone,
                'code' => $code,
                'expires_in_seconds' => $this->ttl,
            ]);
        }

        // Production SMS via Africa's Talking will be wired in a later phase.
    }
}
