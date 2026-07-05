const axios = require('axios');
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
    timeout: 15000,
  });

  client.interceptors.request.use((request) => {
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  });

  return client;
}

async function ensureAuthenticated() {
  if (token) {
    return token;
  }

  const config = loadConfig();
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
    department_name: issue.worker?.department || null,
    address: issue.location?.address || null,
    reporter_name: issue.reporter?.name || null,
    likes_count: issue.likes_count ?? 0,
    dislikes_count: issue.dislikes_count ?? 0,
    comments_count: issue.comments_count ?? 0,
    created_at: issue.created_at || issue.reported_at,
    updated_at: issue.updated_at,
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
  listIssues,
  getStats,
  updateIssue,
  mapIssue,
};
