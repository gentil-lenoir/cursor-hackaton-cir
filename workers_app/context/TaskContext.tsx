import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { api } from '../api/client';
import type { InternalComment, Task, TaskStatus } from '../types';

type TaskContextValue = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  updateLocalTask: (task: Task) => void;
  updateStatus: (taskId: string, status: TaskStatus) => Promise<Task>;
  toggleStep: (taskId: string, stepId: string) => Promise<Task>;
  addStep: (taskId: string, title: string) => Promise<Task>;
  addProgressUpdate: (
    taskId: string,
    body: string,
    photoUri?: string,
  ) => Promise<Task>;
  addComment: (
    taskId: string,
    body: string,
    type: InternalComment['type'],
  ) => Promise<Task>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLocalTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx === -1) return [...prev, task];
      const next = [...prev];
      next[idx] = task;
      return next;
    });
  }, []);

  const wrapMutation = useCallback(
    async (fn: () => Promise<Task>): Promise<Task> => {
      const task = await fn();
      updateLocalTask(task);
      return task;
    },
    [updateLocalTask],
  );

  const updateStatus = useCallback(
    (taskId: string, status: TaskStatus) =>
      wrapMutation(() => api.updateTaskStatus(taskId, status)),
    [wrapMutation],
  );

  const toggleStep = useCallback(
    (taskId: string, stepId: string) =>
      wrapMutation(() => api.toggleStep(taskId, stepId)),
    [wrapMutation],
  );

  const addStep = useCallback(
    (taskId: string, title: string) =>
      wrapMutation(() => api.addStep(taskId, title)),
    [wrapMutation],
  );

  const addProgressUpdate = useCallback(
    (taskId: string, body: string, photoUri?: string) =>
      wrapMutation(() => api.addProgressUpdate(taskId, body, photoUri)),
    [wrapMutation],
  );

  const addComment = useCallback(
    (taskId: string, body: string, type: InternalComment['type']) =>
      wrapMutation(() => api.addComment(taskId, body, type)),
    [wrapMutation],
  );

  const getTaskById = useCallback(
    (id: string) => tasks.find((t) => t.id === id),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      error,
      refreshTasks,
      getTaskById,
      updateLocalTask,
      updateStatus,
      toggleStep,
      addStep,
      addProgressUpdate,
      addComment,
    }),
    [
      tasks,
      isLoading,
      error,
      refreshTasks,
      getTaskById,
      updateLocalTask,
      updateStatus,
      toggleStep,
      addStep,
      addProgressUpdate,
      addComment,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
