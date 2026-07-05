import type { TaskStatus } from '../types';

export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'blocked'],
  in_progress: ['review', 'blocked', 'todo'],
  blocked: ['in_progress'],
  review: [],
  done: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableTransitions(status: TaskStatus): TaskStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

export function requiresProgressUpdateForReview(
  from: TaskStatus,
  to: TaskStatus,
): boolean {
  return from === 'in_progress' && to === 'review';
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  blocked: 'Blocked',
  done: 'Done',
};

export const STATUS_COLORS: Record<
  TaskStatus,
  { bg: string; text: string; border: string }
> = {
  todo: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  in_progress: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  blocked: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  review: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
  done: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
};
