import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthError, PASSWORD_RESET_STEPS } from '@/api/errors'
import { getApiBaseUrl } from '@/api/config'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

type LoginMode = 'email' | 'otp'

export function LoginPage() {
  const { isAuthenticated, isLoading, loginEmail, loginOtp, sendOtp } = useAuth()
  const [mode, setMode] = useState<LoginMode>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('+250')
  const [code, setCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/inbox" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setShowPasswordReset(false)
    setNetworkError(false)
    setSubmitting(true)

    try {
      if (mode === 'email') {
        await loginEmail(email, password)
      } else if (!otpSent) {
        await sendOtp(phone)
        setOtpSent(true)
      } else {
        await loginOtp(phone, code)
      }
    } catch (err) {
      if (err instanceof AuthError && err.code === 'NETWORK_ERROR') {
        setNetworkError(true)
      }
      if (err instanceof AuthError && err.code === 'INVALID_CREDENTIALS') {
        setShowPasswordReset(true)
      }
      const message = err instanceof Error ? err.message : 'Login failed. Check your credentials and try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cir-page-bg relative min-h-screen">
      <div className="cir-theme-toggle absolute right-4 top-4 z-10">
        <ThemeToggle compact />
      </div>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-cir-border bg-cir-surface/95 p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-emerald-400">Government Portal</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">CIR Admin Desktop</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to review issues, assign workers, and oversee resolution.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-cir-bg-deep p-1">
            <button
              type="button"
              onClick={() => {
                setMode('email')
                setError(null)
                setShowPasswordReset(false)
                setOtpSent(false)
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'email' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('otp')
                setError(null)
                setShowPasswordReset(false)
                setOtpSent(false)
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'otp' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone OTP
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === 'email' ? (
              <>
                <label className="block text-sm text-slate-300">
                  Email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
                    placeholder="admin2004@gmail.com"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Password
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-lg border border-cir-border-subtle bg-cir-input py-2 pl-3 pr-10 text-white outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.84 2.84M9.88 5.09A10.94 10.94 0 0112 5c5.52 0 10 4.48 10 10a10.94 10.94 0 01-1.09 4.88M6.11 6.11A10.94 10.94 0 002 15c0 5.52 4.48 10 10 10a10.94 10.94 0 004.89-1.11" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
              </>
            ) : (
              <>
                <label className="block text-sm text-slate-300">
                  Phone (+250)
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                    placeholder="+250788123456"
                  />
                </label>
                {otpSent ? (
                  <label className="block text-sm text-slate-300">
                    OTP Code
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-cir-border-subtle bg-cir-input px-3 py-2 text-white outline-none focus:border-emerald-500"
                      placeholder="123456"
                    />
                  </label>
                ) : null}
              </>
            )}

            {error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

            {networkError ? (
              <div className="rounded-lg border border-cir-border-subtle bg-cir-bg px-3 py-3 text-sm text-slate-300">
                <p className="font-medium text-white">Cannot reach the API</p>
                <p className="mt-1 text-slate-400">
                  The admin app calls <span className="font-mono text-emerald-300">{getApiBaseUrl()}</span>. Start the
                  Laravel backend on port 8000:
                </p>
                <pre className="mt-2 overflow-x-auto rounded bg-cir-surface p-2 text-xs text-slate-300">
                  {`./scripts/start-backend.sh\n# or: php artisan serve --host=0.0.0.0 --port=8000`}
                </pre>
              </div>
            ) : null}

            {showPasswordReset ? (
              <div className="rounded-lg border border-cir-border-subtle bg-cir-bg px-3 py-3 text-sm text-slate-300">
                <p className="font-medium text-white">Forgot or wrong password?</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-slate-400">
                  {PASSWORD_RESET_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Please wait...' : mode === 'otp' && !otpSent ? 'Send OTP' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
