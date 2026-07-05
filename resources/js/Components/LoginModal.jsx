import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { requestOtp, verifyOtp } from '../lib/api';
import { formatPhone, isValidPhone, maskPhone, RWANDA_PREFIX } from '../lib/phone';

export default function LoginModal({ open, onClose }) {
    const [step, setStep] = useState('phone');
    const [digits, setDigits] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!open) {
        return null;
    }

    const phone = formatPhone(digits);

    async function handleRequestOtp(event) {
        event.preventDefault();
        setError('');

        if (!isValidPhone(phone)) {
            setError('Enter a valid Rwanda mobile number (9 digits after +250).');
            return;
        }

        setLoading(true);

        try {
            await requestOtp(phone);
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Could not send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(event) {
        event.preventDefault();
        setError('');

        if (code.length !== 6) {
            setError('Enter the 6-digit verification code.');
            return;
        }

        setLoading(true);

        try {
            await verifyOtp(phone, code);
            onClose?.();
            router.visit('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        setStep('phone');
        setDigits('');
        setCode('');
        setError('');
        onClose?.();
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Sign in with phone</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Rwanda citizens use a one-time code sent to their mobile number.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {step === 'phone' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                Mobile number
                            </span>
                            <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-[var(--color-rw-blue)] focus-within:ring-2 focus-within:ring-[var(--color-rw-blue)]/20">
                                <span className="flex items-center bg-slate-50 px-4 text-sm font-medium text-slate-600">
                                    {RWANDA_PREFIX}
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                    value={digits}
                                    onChange={(event) =>
                                        setDigits(event.target.value.replace(/\D/g, '').slice(0, 9))
                                    }
                                    placeholder="788123456"
                                    className="w-full px-4 py-3 text-base outline-none"
                                />
                            </div>
                        </label>

                        {error && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[var(--color-rw-blue)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                        >
                            {loading ? 'Sending code…' : 'Send verification code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Enter the 6-digit code sent to{' '}
                            <span className="font-medium text-slate-900">{maskPhone(phone)}</span>
                        </p>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                Verification code
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={code}
                                onChange={(event) =>
                                    setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                                }
                                placeholder="123456"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-[var(--color-rw-blue)] focus:ring-2 focus:ring-[var(--color-rw-blue)]/20"
                            />
                        </label>

                        {error && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[var(--color-rw-green)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                        >
                            {loading ? 'Verifying…' : 'Verify and continue'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('phone');
                                setCode('');
                                setError('');
                            }}
                            className="w-full text-sm font-medium text-[var(--color-rw-blue)] hover:underline"
                        >
                            Use a different number
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-xs text-slate-400">
                    In development, OTP codes are written to <code>storage/logs/laravel.log</code>.
                </p>
            </div>
        </div>
    );
}

export function LoginLinkButton({ className = '', children = 'Get started' }) {
    return (
        <Link href="/login" className={className}>
            {children}
        </Link>
    );
}
