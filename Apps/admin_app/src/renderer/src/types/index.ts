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

export interface Task {
  id: number
  issue_id: number
  issue_title: string
  issue_reference: string
  district: string
  assigned_to: number
  assigned_to_name: string
  title: string
  admin_notes: string | null
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskStep {
  id: number
  title: string
  description: string | null
  order: number
  is_completed: boolean
  completed_at: string | null
}

export interface TaskComment {
  id: number
  user_id: number
  author_name: string
  body: string
  type: 'comment' | 'clarification_request'
  created_at: string
}

export interface TaskDetail extends Task {
  steps: TaskStep[]
  comments: TaskComment[]
}

export interface CreateTaskPayload {
  issue_id: number
  assigned_to: number
  due_date?: string
  admin_notes?: string
  steps?: string[]
}

export interface UpdateTaskPayload {
  status?: TaskStatus
  assigned_to?: number
  due_date?: string | null
  admin_notes?: string | null
}

export interface InviteWorkerPayload {
  name: string
  phone: string
}

export interface UpdateWorkerPayload {
  status: UserStatus
}

export interface BulkUpdateIssuesPayload {
  issue_ids: number[]
  status: IssueStatus
}

export interface CreateTaskCommentPayload {
  body: string
  type?: 'comment' | 'clarification_request'
}

export interface CreatePublicNotePayload {
  body: string
}

export interface AnalyticsOverview {
  total_open_issues: number
  resolved_this_month: number
  avg_resolution_days: number
  active_workers: number
  issues_by_district: Array<{ district: string; count: number }>
  issues_by_category: Array<{ category: string; count: number }>
}

export interface FlaggedComment {
  id: number
  issue_id: number
  issue_reference: string
  issue_title: string
  user_id: number
  author_name: string
  body: string
  flagged_count: number
  is_visible: boolean
  comment_banned: boolean
  created_at: string
}

export interface PriorityWeights {
  citizen: number
  ai: number
  community: number
}

export interface NotificationTemplates {
  issue_status_changed: string
  task_assigned: string
  issue_resolved: string
}

export interface AdminSettings {
  priority_weights: PriorityWeights
  ai_prompt_template: string
  notification_templates: NotificationTemplates
  districts: string[]
}

export interface UpdateAdminSettingsPayload {
  priority_weights?: PriorityWeights
  ai_prompt_template?: string
  notification_templates?: NotificationTemplates
  districts?: string[]
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
