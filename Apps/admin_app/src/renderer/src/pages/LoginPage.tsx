import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

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
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/inbox" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
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
      const message = err instanceof Error ? err.message : 'Login failed. Check your credentials and try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-sky-400">Government Portal</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">CIR Admin Desktop</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to review issues, assign workers, and oversee resolution.</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('email')
              setError(null)
              setOtpSent(false)
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'email' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('otp')
              setError(null)
              setOtpSent(false)
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'otp' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
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
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
                  placeholder="admin@cir.rw"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
                />
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
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500 disabled:opacity-60"
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
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
                    placeholder="123456"
                  />
                </label>
              ) : null}
            </>
          )}

          {error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Please wait...' : mode === 'otp' && !otpSent ? 'Send OTP' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
