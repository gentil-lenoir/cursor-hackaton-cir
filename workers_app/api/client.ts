import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthSession,
  InternalComment,
  Task,
  TaskStatus,
  WorkerProfile,
} from '../types';
import { INITIAL_TASKS, MOCK_WORKER } from './mockData';
import {
  canTransition,
  requiresProgressUpdateForReview,
} from '../utils/statusTransitions';

/** Flip to false when Laravel backend is ready — all HTTP calls live here. */
export const USE_MOCK = true;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

const TOKEN_KEY = 'cir_worker_token';
const WORKER_KEY = 'cir_worker_profile';

let mockTasks: Task[] = JSON.parse(JSON.stringify(INITIAL_TASKS));

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function findTask(id: string): Task {
  const task = mockTasks.find((t) => t.id === id);
  if (!task) throw new Error('Task not found');
  return task;
}

function cloneTask(task: Task): Task {
  return JSON.parse(JSON.stringify(task));
}

// ─── Axios instance (used when USE_MOCK = false) ───────────────────────────

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Mock implementations ──────────────────────────────────────────────────

async function mockRequestOtp(phone: string): Promise<{ message: string }> {
  await delay();
  if (!/^\+250\d{9}$/.test(phone)) {
    throw new Error('Phone must be +250 followed by 9 digits (e.g. +250788123456)');
  }
  return { message: 'OTP sent successfully (mock — use any 6-digit code).' };
}

async function mockVerifyOtp(
  phone: string,
  code: string,
): Promise<AuthSession> {
  await delay();
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Enter a valid 6-digit OTP code.');
  }
  const session: AuthSession = {
    token: `mock-token-${Date.now()}`,
    worker: { ...MOCK_WORKER, phone },
  };
  await AsyncStorage.setItem(TOKEN_KEY, session.token);
  await AsyncStorage.setItem(WORKER_KEY, JSON.stringify(session.worker));
  return session;
}

async function mockGetSession(): Promise<AuthSession | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const workerJson = await AsyncStorage.getItem(WORKER_KEY);
  if (!token || !workerJson) return null;
  return { token, worker: JSON.parse(workerJson) as WorkerProfile };
}

async function mockLogout(): Promise<void> {
  await delay(200);
  await AsyncStorage.multiRemove([TOKEN_KEY, WORKER_KEY]);
}

async function mockGetTasks(): Promise<Task[]> {
  await delay();
  return mockTasks.map(cloneTask);
}

async function mockGetTask(id: string): Promise<Task> {
  await delay();
  return cloneTask(findTask(id));
}

async function mockUpdateStatus(id: string, status: TaskStatus): Promise<Task> {
  await delay();
  const task = findTask(id);

  if (!canTransition(task.status, status)) {
    throw new Error(`Cannot move from "${task.status}" to "${status}".`);
  }

  if (requiresProgressUpdateForReview(task.status, status) && task.updates.length === 0) {
    throw new Error(
      'Post at least one progress update before submitting for review.',
    );
  }

  task.status = status;
  return cloneTask(task);
}

async function mockToggleStep(taskId: string, stepId: string): Promise<Task> {
  await delay(300);
  const task = findTask(taskId);
  const step = task.steps.find((s) => s.id === stepId);
  if (!step) throw new Error('Step not found');

  step.is_completed = !step.is_completed;
  step.completed_at = step.is_completed ? new Date().toISOString() : undefined;
  return cloneTask(task);
}

async function mockAddStep(taskId: string, title: string): Promise<Task> {
  await delay();
  const task = findTask(taskId);
  const workerSteps = task.steps.filter((s) => s.added_by === 'worker');
  const maxOrder = Math.max(...task.steps.map((s) => s.order), 0);
  task.steps.push({
    id: uid('step'),
    title: title.trim(),
    is_completed: false,
    added_by: 'worker',
    order: maxOrder + 1,
  });
  // Worker steps sort after admin steps by order within their group
  void workerSteps;
  return cloneTask(task);
}

async function mockAddProgressUpdate(
  taskId: string,
  body: string,
  photoUri?: string,
): Promise<Task> {
  await delay();
  if (body.trim().length < 10) {
    throw new Error('Progress update must be at least 10 characters.');
  }
  const task = findTask(taskId);
  task.updates.unshift({
    id: uid('update'),
    body: body.trim(),
    photo_url: photoUri,
    created_at: new Date().toISOString(),
  });
  return cloneTask(task);
}

async function mockAddComment(
  taskId: string,
  body: string,
  type: InternalComment['type'],
): Promise<Task> {
  await delay();
  if (!body.trim()) throw new Error('Comment cannot be empty.');
  const task = findTask(taskId);
  task.comments.push({
    id: uid('comment'),
    body: body.trim(),
    author: 'worker',
    type,
    created_at: new Date().toISOString(),
  });
  return cloneTask(task);
}

// ─── Real API implementations (stubs matching expected Laravel endpoints) ──

async function realRequestOtp(phone: string): Promise<{ message: string }> {
  const { data } = await http.post('/worker/auth/otp/request', { phone });
  return data;
}

async function realVerifyOtp(phone: string, code: string): Promise<AuthSession> {
  const { data } = await http.post('/worker/auth/otp/verify', { phone, code });
  const session: AuthSession = {
    token: data.data.token,
    worker: data.data.worker,
  };
  await AsyncStorage.setItem(TOKEN_KEY, session.token);
  await AsyncStorage.setItem(WORKER_KEY, JSON.stringify(session.worker));
  return session;
}

async function realGetSession(): Promise<AuthSession | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const { data } = await http.get('/me');
    const workerJson = await AsyncStorage.getItem(WORKER_KEY);
    return {
      token,
      worker: workerJson
        ? JSON.parse(workerJson)
        : data.data?.profile ?? data.user,
    };
  } catch {
    await AsyncStorage.multiRemove([TOKEN_KEY, WORKER_KEY]);
    return null;
  }
}

async function realLogout(): Promise<void> {
  try {
    await http.post('/logout');
  } finally {
    await AsyncStorage.multiRemove([TOKEN_KEY, WORKER_KEY]);
  }
}

async function realGetTasks(): Promise<Task[]> {
  const { data } = await http.get('/worker/tasks');
  return data.data.tasks;
}

async function realGetTask(id: string): Promise<Task> {
  const { data } = await http.get(`/worker/tasks/${id}`);
  return data.data.task;
}

async function realUpdateStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data } = await http.patch(`/worker/tasks/${id}/status`, { status });
  return data.data.task;
}

async function realToggleStep(taskId: string, stepId: string): Promise<Task> {
  const { data } = await http.patch(`/worker/tasks/${taskId}/steps/${stepId}`);
  return data.data.task;
}

async function realAddStep(taskId: string, title: string): Promise<Task> {
  const { data } = await http.post(`/worker/tasks/${taskId}/steps`, { title });
  return data.data.task;
}

async function realAddProgressUpdate(
  taskId: string,
  body: string,
  photoUri?: string,
): Promise<Task> {
  const form = new FormData();
  form.append('body', body);
  if (photoUri) {
    form.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'progress.jpg',
    } as unknown as Blob);
  }
  const { data } = await http.post(`/worker/tasks/${taskId}/updates`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.task;
}

async function realAddComment(
  taskId: string,
  body: string,
  type: InternalComment['type'],
): Promise<Task> {
  const { data } = await http.post(`/worker/tasks/${taskId}/comments`, {
    body,
    type,
  });
  return data.data.task;
}

/** Reset mock store — useful during development. */
export function resetMockData(): void {
  mockTasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
}

// ─── Public API (single swap point) ────────────────────────────────────────

export const api = {
  requestOtp: (phone: string) =>
    USE_MOCK ? mockRequestOtp(phone) : realRequestOtp(phone),

  verifyOtp: (phone: string, code: string) =>
    USE_MOCK ? mockVerifyOtp(phone, code) : realVerifyOtp(phone, code),

  getSession: () => (USE_MOCK ? mockGetSession() : realGetSession()),

  logout: () => (USE_MOCK ? mockLogout() : realLogout()),

  getTasks: () => (USE_MOCK ? mockGetTasks() : realGetTasks()),

  getTask: (id: string) => (USE_MOCK ? mockGetTask(id) : realGetTask(id)),

  updateTaskStatus: (id: string, status: TaskStatus) =>
    USE_MOCK ? mockUpdateStatus(id, status) : realUpdateStatus(id, status),

  toggleStep: (taskId: string, stepId: string) =>
    USE_MOCK ? mockToggleStep(taskId, stepId) : realToggleStep(taskId, stepId),

  addStep: (taskId: string, title: string) =>
    USE_MOCK ? mockAddStep(taskId, title) : realAddStep(taskId, title),

  addProgressUpdate: (taskId: string, body: string, photoUri?: string) =>
    USE_MOCK
      ? mockAddProgressUpdate(taskId, body, photoUri)
      : realAddProgressUpdate(taskId, body, photoUri),

  addComment: (
    taskId: string,
    body: string,
    type: InternalComment['type'],
  ) =>
    USE_MOCK
      ? mockAddComment(taskId, body, type)
      : realAddComment(taskId, body, type),
};
