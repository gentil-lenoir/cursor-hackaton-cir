import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api/client';
import type { WorkerProfile } from '../types';

type AuthContextValue = {
  worker: WorkerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getSession()
      .then((session) => setWorker(session?.worker ?? null))
      .finally(() => setIsLoading(false));
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    await api.requestOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const session = await api.verifyOtp(phone, code);
    setWorker(session.worker);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setWorker(null);
  }, []);

  const value = useMemo(
    () => ({
      worker,
      isLoading,
      isAuthenticated: !!worker,
      requestOtp,
      verifyOtp,
      logout,
    }),
    [worker, isLoading, requestOtp, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
