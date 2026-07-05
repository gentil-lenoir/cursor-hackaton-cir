import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import CitizenLayout from '../Layouts/CitizenLayout';
import { requestOtp, verifyOtp } from '../lib/api';
import { formatPhone, isValidPhone, maskPhone, RWANDA_PREFIX } from '../lib/phone';

export default function Login() {
    const [step, setStep] = useState('phone');
    const [digits, setDigits] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            router.visit('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <CitizenLayout>
            <Head title="Login" />

            <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12 sm:px-6">
                <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-rw-blue)] via-[var(--color-rw-yellow)] to-[var(--color-rw-green)] text-lg font-bold text-white">
                            CIR
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Citizen login</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Sign in or register automatically with your Rwanda mobile number.
                        </p>
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
                                        autoFocus
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
                                    autoFocus
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
                        Development mode: check <code>storage/logs/laravel.log</code> for OTP codes.
                    </p>
                </div>
            </div>
        </CitizenLayout>
    );
}
