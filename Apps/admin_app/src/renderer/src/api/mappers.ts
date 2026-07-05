import type { Issue, IssueComment, IssueStatus, User } from '@/types'

type ApiUser = {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  role: string
}

type ApiIssue = {
  id: number
  title: string
  description?: string | null
  category?: string | null
  status: string
  priority?: number | null
  location?: {
    latitude?: number
    longitude?: number
    address?: string | null
  }
  reported_at?: string | null
  reporter?: { name?: string | null }
  created_at?: string
  updated_at?: string
}

const STATUS_MAP: Record<string, IssueStatus> = {
  reported: 'submitted',
  submitted: 'submitted',
  under_review: 'under_review',
  assigned: 'assigned',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed',
  rejected: 'rejected',
  escalated: 'under_review'
}

export function mapApiUser(raw: ApiUser): User {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    role: raw.role === 'municipal_manager' || raw.role === 'system_manager' ? 'admin' : 'citizen',
    status: 'active',
    language: 'en'
  }
}

export function mapApiIssue(raw: ApiIssue): Issue {
  const priority = raw.priority ?? 3

  return {
    id: raw.id,
    reference_number: `ISS-${String(raw.id).padStart(4, '0')}`,
    reporter_name: raw.reporter?.name ?? 'Citizen',
    title: raw.title,
    description: raw.description ?? '',
    district: raw.location?.address?.split(',')[0]?.trim() || 'Unknown',
    sector: null,
    status: STATUS_MAP[raw.status] ?? 'submitted',
    citizen_priority: priority,
    ai_priority: null,
    ai_category: raw.category ?? null,
    ai_summary: null,
    ai_tags: null,
    ai_confidence: null,
    community_score: 0,
    final_priority: priority,
    admin_priority_override: null,
    latitude: raw.location?.latitude ?? null,
    longitude: raw.location?.longitude ?? null,
    resolved_at: raw.status === 'resolved' ? raw.updated_at ?? null : null,
    created_at: raw.reported_at ?? raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? raw.reported_at ?? new Date().toISOString()
  }
}

export function mapApiComment(raw: {
  id: number
  user_id?: number
  comment?: string
  body?: string
  created_at?: string
}): IssueComment {
  return {
    id: raw.id,
    user_id: raw.user_id ?? 0,
    body: raw.body ?? raw.comment ?? '',
    created_at: raw.created_at ?? new Date().toISOString()
  }
}
