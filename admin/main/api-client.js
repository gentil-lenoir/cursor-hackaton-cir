const axios = require('axios');
const https = require('https');
const { loadConfig } = require('./config');

let token = null;
let client = null;

function getClient() {
  if (client) {
    return client;
  }

  const config = loadConfig();
  client = axios.create({
    baseURL: config.apiBaseUrl.replace(/\/$/, ''),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 20000,
    httpsAgent: new https.Agent({ family: 4 }),
  });

  client.interceptors.request.use((request) => {
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  });

  return client;
}

function formatApiError(error) {
  if (!error) {
    return 'Unknown error';
  }

  if (error.response?.data?.message) {
    const validationErrors = error.response.data.errors;

    if (validationErrors && typeof validationErrors === 'object') {
      const details = Object.values(validationErrors).flat().join(' ');

      return details ? `${error.response.data.message} ${details}` : error.response.data.message;
    }

    return error.response.data.message;
  }

  if (error.response?.status) {
    return `Request failed with status ${error.response.status}`;
  }

  if (error.code) {
    const nested = error.cause?.errors?.find((entry) => entry?.message || entry?.code);

    if (nested) {
      return `${error.code}: ${nested.message || nested.code}`;
    }

    return error.code;
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (error.cause?.errors?.length) {
    return error.cause.errors
      .map((entry) => entry.message || entry.code)
      .filter(Boolean)
      .join('; ');
  }

  return 'Network request failed. Check the API URL and your internet connection.';
}

function resetAuth() {
  token = null;
  client = null;
}

async function ensureAuthenticated() {
  if (token) {
    return token;
  }

  const config = loadConfig();

  try {
    const response = await getClient().post('/login', {
      email: config.adminEmail,
      password: config.adminPassword,
    });

    token = response.data.access_token
      || response.data.data?.token
      || response.data.token
      || null;

    if (!token) {
      throw new Error('Admin login succeeded but no API token was returned.');
    }

    return token;
  } catch (error) {
    resetAuth();

    if (error.response?.status === 422) {
      throw new Error(`Admin login failed: ${formatApiError(error)} Check admin/config.json credentials and ensure the admin user exists on the server.`);
    }

    throw error;
  }
}

function mapIssue(issue) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    status: issue.status,
    priority: issue.priority,
    worker_id: issue.worker?.id || issue.assignment?.worker?.id || null,
    worker_name: issue.worker?.name || issue.assignment?.worker?.name || null,
    department_name: issue.worker?.department || issue.worker?.department_name || null,
    address: issue.location?.address || issue.address || null,
    latitude: issue.location?.latitude ?? null,
    longitude: issue.location?.longitude ?? null,
    reporter_name: issue.reporter?.name || null,
    reporter_id: issue.reporter?.id || null,
    likes_count: issue.likes_count ?? 0,
    dislikes_count: issue.dislikes_count ?? 0,
    comments_count: issue.comments_count ?? 0,
    deadline: issue.deadline || issue.assignment?.deadline_at?.slice(0, 10) || null,
    images: Array.isArray(issue.images)
      ? issue.images.map((img) => ({ id: img.id, url: img.url }))
      : [],
    created_at: issue.created_at || issue.reported_at,
    updated_at: issue.updated_at,
    reported_at: issue.reported_at || issue.created_at,
  };
}

function mapWorker(worker) {
  return {
    id: worker.id,
    name: worker.name,
    email: worker.email,
    phone: worker.phone || null,
    department_id: worker.department_id || null,
    department_name: worker.department_name || worker.department?.name || null,
    status: worker.status || 'active',
    availability_status: worker.availability_status || 'available',
    theme_preference: worker.theme_preference || 'light',
    issues_count: worker.issues_count ?? 0,
    created_at: worker.created_at,
    updated_at: worker.updated_at,
  };
}

function mapDepartment(department) {
  return {
    id: department.id,
    name: department.name,
    code: department.code || null,
    description: department.description || null,
    workers_count: department.workers_count ?? 0,
    created_at: department.created_at,
    updated_at: department.updated_at,
  };
}

async function listIssues({ search = '', status = '', page = 1, limit = 50 } = {}) {
  const params = {
    page,
    limit,
  };

  if (search) {
    params.search = search;
  }

  if (status) {
    params.status = status;
  }

  const response = await getClient().get('/issues', { params });
  const issues = Array.isArray(response.data?.data) ? response.data.data : [];
  const meta = response.data?.meta || {};

  return {
    issues: issues.map(mapIssue),
    total: meta.total ?? issues.length,
    page: meta.current_page ?? page,
    limit: meta.per_page ?? limit,
  };
}

async function getStats() {
  const response = await getClient().get('/stats');
  return response.data?.data || {};
}

async function getAdminStats() {
  await ensureAuthenticated();

  const response = await getClient().get('/admin/stats');
  return response.data?.data || {};
}

async function listWorkers({ search = '', department = '', status = '', page = 1, limit = 10, sort = '' } = {}) {
  await ensureAuthenticated();

  const params = { page, limit };

  if (search) {
    params.search = search;
  }

  if (department) {
    params.department = department;
  }

  if (status) {
    params.status = status;
  }

  if (sort) {
    params.sort = sort;
  }

  const response = await getClient().get('/admin/workers', { params });
  const workers = Array.isArray(response.data?.data) ? response.data.data : [];
  const meta = response.data?.meta || {};

  return {
    workers: workers.map(mapWorker),
    total: meta.total ?? workers.length,
    page: meta.current_page ?? page,
    limit: meta.per_page ?? limit,
  };
}

async function getTopWorkers(limit = 5) {
  const data = await listWorkers({ limit, page: 1, sort: 'issues_count' });
  return data.workers;
}

async function createWorker(worker) {
  await ensureAuthenticated();

  const payload = {
    name: worker.name,
    email: worker.email,
    phone: worker.phone || null,
    department_id: worker.department_id ? Number(worker.department_id) : null,
    status: worker.status || 'active',
    availability_status: worker.availability_status || 'available',
    theme_preference: worker.theme_preference || 'light',
  };

  const response = await getClient().post('/admin/workers', payload);
  const created = response.data?.data || response.data;

  return {
    id: created.id,
    worker: mapWorker(created),
  };
}

async function updateWorker(id, worker) {
  await ensureAuthenticated();

  const payload = {
    name: worker.name,
    email: worker.email,
    phone: worker.phone || null,
  };

  if (worker.department_id) {
    payload.department_id = Number(worker.department_id);
  }

  if (worker.status) {
    payload.status = worker.status;
  }

  if (worker.availability_status) {
    payload.availability_status = worker.availability_status;
  }

  if (worker.theme_preference) {
    payload.theme_preference = worker.theme_preference;
  }

  await getClient().put(`/admin/workers/${id}`, payload);
}

async function deleteWorker(id) {
  await ensureAuthenticated();
  await getClient().delete(`/admin/workers/${id}`);
}

async function toggleWorkerStatus(id) {
  await ensureAuthenticated();

  const response = await getClient().patch(`/admin/workers/${id}/toggle-status`);
  return response.data?.data || {};
}

async function listDepartments() {
  await ensureAuthenticated();

  const response = await getClient().get('/admin/departments');
  const departments = Array.isArray(response.data?.data) ? response.data.data : [];

  return departments.map(mapDepartment);
}

async function createDepartment(dept) {
  await ensureAuthenticated();

  const response = await getClient().post('/admin/departments', {
    name: dept.name,
    description: dept.description || null,
  });

  const created = response.data?.data || response.data;

  return {
    id: created.id,
    department: mapDepartment(created),
  };
}

async function updateDepartment(id, dept) {
  await ensureAuthenticated();

  await getClient().put(`/admin/departments/${id}`, {
    name: dept.name,
    description: dept.description || null,
  });
}

async function deleteDepartment(id) {
  await ensureAuthenticated();
  await getClient().delete(`/admin/departments/${id}`);
}

async function getIssueDetail(id) {
  await ensureAuthenticated();

  const response = await getClient().get(`/admin/issues/${id}`);
  const issue = response.data?.data || response.data;

  return mapIssue(issue);
}

async function assignIssue(id, assignment) {
  await ensureAuthenticated();

  const payload = {
    worker_id: Number(assignment.worker_id),
    deadline: assignment.deadline,
    status: assignment.status || 'in_progress',
  };

  if (assignment.priority) {
    payload.priority = assignment.priority;
  }

  const response = await getClient().patch(`/admin/issues/${id}/assign`, payload);
  const issue = response.data?.data || response.data;

  return mapIssue(issue);
}

async function updateIssue(id, issue) {
  await ensureAuthenticated();

  const response = await getClient().put(`/issues/${id}`, {
    status: issue.status,
    priority: issue.priority,
  });

  return mapIssue(response.data?.data || response.data);
}

module.exports = {
  ensureAuthenticated,
  resetAuth,
  listIssues,
  getStats,
  getAdminStats,
  listWorkers,
  getTopWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  toggleWorkerStatus,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getIssueDetail,
  assignIssue,
  updateIssue,
  mapIssue,
  mapWorker,
  mapDepartment,
  formatApiError,
};
