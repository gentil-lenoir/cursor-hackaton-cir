export type TaskCategory =
  | 'roads'
  | 'water'
  | 'electricity'
  | 'sanitation'
  | 'health'
  | 'education'
  | 'security'
  | 'environment'
  | 'other';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'blocked' | 'done';

export type TaskStep = {
  id: string;
  title: string;
  is_completed: boolean;
  completed_at?: string;
  added_by: 'admin' | 'worker';
  order: number;
};

export type ProgressUpdate = {
  id: string;
  body: string;
  photo_url?: string;
  created_at: string;
};

export type InternalComment = {
  id: string;
  body: string;
  author: 'worker' | 'admin';
  type: 'comment' | 'clarification_request';
  created_at: string;
};

export type Task = {
  id: string;
  issue: {
    title: string;
    description: string;
    district: string;
    category: TaskCategory;
    photos: string[];
    latitude?: number;
    longitude?: number;
  };
  status: TaskStatus;
  due_date?: string;
  admin_notes?: string;
  steps: TaskStep[];
  updates: ProgressUpdate[];
  comments: InternalComment[];
};

export type WorkerProfile = {
  id: string;
  name: string;
  phone: string;
  department?: string;
};

export type AuthSession = {
  token: string;
  worker: WorkerProfile;
};

export type RootStackParamList = {
  PhoneLogin: undefined;
  OtpVerify: { phone: string };
  TaskList: undefined;
  TaskDetail: { taskId: string };
  Kanban: undefined;
};
