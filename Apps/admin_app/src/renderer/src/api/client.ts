import axios from 'axios'
import type {
  ActivityLogEntry,
  ApiResponse,
  AuthSession,
  Issue,
  IssueComment,
  LoginResponse,
  User,
  Worker
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const SESSION_KEY = 'cir_admin_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as AuthSession
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveSession(token: string, user: User): AuthSession {
  const session: AuthSession = {
    token,
    user,
    expiresAt: Date.now() + SESSION_TTL_MS
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export async function loginWithEmail(email: string, password: string): Promise<AuthSession> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password })
  return saveSession(data.data.token, data.data.user)
}

export async function loginWithOtp(phone: string, code: string): Promise<AuthSession> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/otp/verify', { phone, code })
  return saveSession(data.data.token, data.data.user)
}

export async function requestOtp(phone: string): Promise<void> {
  await api.post('/auth/otp/request', { phone })
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me')
  return data.data
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } finally {
    clearSession()
  }
}

export interface IssueListParams {
  page?: number
  search?: string
  status?: string
  district?: string
  category?: string
  sort?: string
}

export async function fetchAdminIssues(params: IssueListParams = {}): Promise<ApiResponse<Issue[]>> {
  const { data } = await api.get<ApiResponse<Issue[]>>('/admin/issues', { params })
  return data
}

export async function fetchAdminIssue(id: number): Promise<Issue> {
  const { data } = await api.get<ApiResponse<Issue>>(`/admin/issues/${id}`)
  return data.data
}

export async function updateAdminIssue(
  id: number,
  payload: { status?: string; admin_priority_override?: number | null }
): Promise<Issue> {
  const { data } = await api.patch<ApiResponse<Issue>>(`/admin/issues/${id}`, payload)
  return data.data
}

export async function fetchIssueComments(issueId: number): Promise<IssueComment[]> {
  const { data } = await api.get<ApiResponse<IssueComment[]>>(`/issues/${issueId}/comments`)
  return data.data
}

export async function fetchIssueActivity(issueId: number): Promise<ActivityLogEntry[]> {
  const { data } = await api.get<ApiResponse<ActivityLogEntry[]>>(`/admin/issues/${issueId}/activity`)
  return data.data
}

export async function fetchWorkers(): Promise<Worker[]> {
  const { data } = await api.get<ApiResponse<Worker[]>>('/admin/workers')
  return data.data
}
