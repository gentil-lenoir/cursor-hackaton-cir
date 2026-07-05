import axios from 'axios'
import { getApiBaseUrl, isAdminApiRole } from '@/api/config'
import { AuthError, parseAuthError } from '@/api/errors'
import { mapApiComment, mapApiIssue, mapApiUser } from '@/api/mappers'
import type {
  ActivityLogEntry,
  AdminSettings,
  AnalyticsOverview,
  ApiResponse,
  AuthSession,
  BulkUpdateIssuesPayload,
  CreatePublicNotePayload,
  CreateTaskCommentPayload,
  CreateTaskPayload,
  FlaggedComment,
  Issue,
  IssueComment,
  Task,
  TaskDetail,
  TaskComment,
  UpdateAdminSettingsPayload,
  UpdateTaskPayload,
  UpdateWorkerPayload,
  User,
  Worker
} from '@/types'

const SESSION_KEY = 'cir_admin_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

export { ADMIN_API_ROLES, getApiBaseUrl, isAdminApiRole } from '@/api/config'

type ApiUserLike = Parameters<typeof mapApiUser>[0]

type LoginApiResponse = {
  data?: {
    token: string
    user: ApiUserLike
  }
  access_token?: string
  user?: ApiUserLike
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
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

function extractLoginPayload(data: LoginApiResponse): { token: string; user: ApiUserLike } {
  if (data.data?.token && data.data.user) {
    return data.data
  }

  const token = data.access_token
  const user = data.user
  if (token && user) {
    return { token, user }
  }

  throw new AuthError('Unexpected login response from the API.', 'NETWORK_ERROR')
}

export async function loginWithEmail(email: string, password: string): Promise<AuthSession> {
  try {
    const { data } = await api.post<LoginApiResponse>('/login', { email, password })
    const { token, user: rawUser } = extractLoginPayload(data)

    if (!isAdminApiRole(rawUser.role)) {
      throw new AuthError('Only municipal manager accounts can access this application.', 'NOT_ADMIN')
    }

    return saveSession(token, mapApiUser(rawUser))
  } catch (error) {
    throw parseAuthError(error)
  }
}

export async function loginWithOtp(_phone: string, _code: string): Promise<AuthSession> {
  throw new AuthError('Phone OTP login is not available yet. Use email and password.', 'INVALID_OTP')
}

export async function requestOtp(_phone: string): Promise<void> {
  throw new AuthError('Phone OTP login is not available yet. Use email and password.', 'INVALID_OTP')
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<{ data: { user: ApiUserLike } }>('/me')
  const raw = data.data.user

  if (!isAdminApiRole(raw.role)) {
    throw new AuthError('Only municipal manager accounts can access this application.', 'NOT_ADMIN')
  }

  return mapApiUser(raw)
}

export async function logout(): Promise<void> {
  try {
    await api.post('/logout')
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
  const { data } = await api.get<{ data: unknown[]; meta?: ApiResponse<Issue[]>['meta'] }>('/issues', {
    params: {
      search: params.search,
      status: params.status,
      category: params.category,
      limit: 50
    }
  })

  return {
    data: (data.data ?? []).map((item) => mapApiIssue(item as Parameters<typeof mapApiIssue>[0])),
    meta: data.meta
  }
}

export async function fetchAdminIssue(id: number): Promise<Issue> {
  const { data } = await api.get<{ data: Parameters<typeof mapApiIssue>[0] }>(`/issues/${id}`)
  return mapApiIssue(data.data)
}

export async function updateAdminIssue(
  id: number,
  payload: { status?: string; admin_priority_override?: number | null }
): Promise<Issue> {
  const { data } = await api.put<{ data: Parameters<typeof mapApiIssue>[0] }>(`/issues/${id}`, payload)
  return mapApiIssue(data.data)
}

export async function fetchIssueComments(issueId: number): Promise<IssueComment[]> {
  const { data } = await api.get<{ data: Parameters<typeof mapApiComment>[0][] }>(`/issues/${issueId}/comments`)
  return (data.data ?? []).map(mapApiComment)
}

export async function fetchIssueActivity(_issueId: number): Promise<ActivityLogEntry[]> {
  return []
}

export async function fetchWorkers(): Promise<Worker[]> {
  const { data } = await api.get<ApiResponse<Worker[]>>('/admin/workers')
  return data.data ?? []
}

export async function fetchAdminTasks(): Promise<Task[]> {
  const { data } = await api.get<ApiResponse<Task[]>>('/admin/tasks')
  return data.data ?? []
}

export async function createAdminTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post<ApiResponse<Task>>('/admin/tasks', payload)
  return data.data
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await api.get<{
    data: {
      total_issues?: number
      resolved_issues?: number
      pending_issues?: number
    }
  }>('/stats')

  return {
    total_open_issues: data.data.pending_issues ?? 0,
    resolved_this_month: data.data.resolved_issues ?? 0,
    avg_resolution_days: 0,
    active_workers: 0,
    issues_by_district: [],
    issues_by_category: []
  }
}

export async function fetchFlaggedComments(): Promise<FlaggedComment[]> {
  const { data } = await api.get<ApiResponse<FlaggedComment[]>>('/admin/moderation/comments')
  return data.data ?? []
}

export async function approveFlaggedComment(id: number): Promise<void> {
  await api.post(`/admin/moderation/comments/${id}/approve`)
}

export async function deleteFlaggedComment(id: number): Promise<void> {
  await api.delete(`/admin/moderation/comments/${id}`)
}

export async function banCommentAuthor(userId: number): Promise<void> {
  await api.post(`/admin/moderation/users/${userId}/ban-comments`)
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  const { data } = await api.get<ApiResponse<AdminSettings>>('/admin/settings')
  return data.data
}

export async function updateAdminSettings(payload: UpdateAdminSettingsPayload): Promise<AdminSettings> {
  const { data } = await api.patch<ApiResponse<AdminSettings>>('/admin/settings', payload)
  return data.data
}

export async function bulkUpdateAdminIssues(payload: BulkUpdateIssuesPayload): Promise<Issue[]> {
  const { data } = await api.patch<ApiResponse<Issue[]>>('/admin/issues/bulk', payload)
  return data.data
}

export async function createIssuePublicNote(issueId: number, payload: CreatePublicNotePayload): Promise<void> {
  await api.post(`/admin/issues/${issueId}/public-note`, payload)
}

export async function fetchAdminTask(id: number): Promise<TaskDetail> {
  const { data } = await api.get<ApiResponse<TaskDetail>>(`/admin/tasks/${id}`)
  return data.data
}

export async function updateAdminTask(id: number, payload: UpdateTaskPayload): Promise<TaskDetail> {
  const { data } = await api.patch<ApiResponse<TaskDetail>>(`/admin/tasks/${id}`, payload)
  return data.data
}

export async function deleteAdminTask(id: number): Promise<void> {
  await api.delete(`/admin/tasks/${id}`)
}

export async function approveAdminTask(id: number): Promise<TaskDetail> {
  const { data } = await api.post<ApiResponse<TaskDetail>>(`/admin/tasks/${id}/approve`)
  return data.data
}

export async function rejectAdminTask(id: number): Promise<TaskDetail> {
  const { data } = await api.post<ApiResponse<TaskDetail>>(`/admin/tasks/${id}/reject`)
  return data.data
}

export async function createTaskComment(taskId: number, payload: CreateTaskCommentPayload): Promise<TaskComment> {
  const { data } = await api.post<ApiResponse<TaskComment>>(`/admin/tasks/${taskId}/comments`, payload)
  return data.data
}

export async function inviteWorker(payload: { name: string; phone: string }): Promise<Worker> {
  const { data } = await api.post<ApiResponse<Worker>>('/admin/workers/invite', payload)
  return data.data
}

export async function updateWorker(id: number, payload: UpdateWorkerPayload): Promise<Worker> {
  const { data } = await api.patch<ApiResponse<Worker>>(`/admin/workers/${id}`, payload)
  return data.data
}
