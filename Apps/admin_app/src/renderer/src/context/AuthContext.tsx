import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearSession,
  fetchCurrentUser,
  getSession,
  loginWithEmail,
  loginWithOtp,
  logout as apiLogout,
  requestOtp
} from '@/api/client'
import type { AuthSession, User } from '@/types'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  loginEmail: (email: string, password: string) => Promise<void>
  loginOtp: (phone: string, code: string) => Promise<void>
  sendOtp: (phone: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getSession())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      const existing = getSession()
      if (!existing) {
        setIsLoading(false)
        return
      }

      try {
        const user = await fetchCurrentUser()
        if (user.role !== 'admin') {
          clearSession()
          setSession(null)
        } else {
          setSession({ ...existing, user })
        }
      } catch {
        clearSession()
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [])

  const loginEmail = useCallback(async (email: string, password: string) => {
    const next = await loginWithEmail(email, password)
    setSession(next)
  }, [])

  const loginOtp = useCallback(async (phone: string, code: string) => {
    const next = await loginWithOtp(phone, code)
    setSession(next)
  }, [])

  const sendOtp = useCallback(async (phone: string) => {
    await requestOtp(phone)
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: Boolean(session?.user && session.user.role === 'admin'),
      loginEmail,
      loginOtp,
      sendOtp,
      logout
    }),
    [session, isLoading, loginEmail, loginOtp, sendOtp, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
