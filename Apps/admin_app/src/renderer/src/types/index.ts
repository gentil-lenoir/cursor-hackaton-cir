export type UserRole = 'citizen' | 'worker' | 'admin'

export type UserStatus = 'active' | 'invited' | 'deactivated'

export type IssueStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected'

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'

export interface User {
  id: number
  name: string
  phone: string | null
  email: string | null
  role: UserRole
  status: UserStatus
  language: string
}

export interface Issue {
  id: number
  reference_number: string
  reporter_name: string
  title: string
  description: string
  district: string
  sector: string | null
  status: IssueStatus
  citizen_priority: number
  ai_priority: number | null
  ai_category: string | null
  ai_summary: string | null
  ai_tags: string[] | null
  ai_confidence: number | null
  community_score: number
  final_priority: number
  admin_priority_override: number | null
  latitude: number | null
  longitude: number | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface IssuePhoto {
  id: number
  url: string
  order: number
}

export interface IssueComment {
  id: number
  user_id: number
  body: string
  created_at: string
}

export interface ActivityLogEntry {
  id: number
  user_id: number | null
  action: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Worker {
  id: number
  name: string
  phone: string
  status: UserStatus
  active_task_count?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: {
    current_page: number
    last_page: number
    total: number
  }
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AuthSession {
  token: string
  user: User
  expiresAt: number
}

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected'
}

export const PRIORITY_COLORS: Record<number, string> = {
  1: 'bg-emerald-500',
  2: 'bg-lime-500',
  3: 'bg-amber-500',
  4: 'bg-orange-500',
  5: 'bg-red-500'
}
