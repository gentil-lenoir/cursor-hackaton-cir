const { ipcMain } = require('electron');
const apiClient = require('./api-client');
const { loadConfig } = require('./config');

function setupIPC() {
  // Dashboard stats
  ipcMain.handle('dashboard:getStats', async () => {
    try {
      let adminStats = {
        workers: 0,
        active_workers: 0,
        departments: 0,
      };

      try {
        adminStats = await apiClient.getAdminStats();
      } catch (apiError) {
        const adminStatsError = apiClient.formatApiError(apiError);
        console.error('Admin stats failed:', adminStatsError);

        return {
          success: false,
          error: `Could not load worker stats from API (${loadConfig().apiBaseUrl}): ${adminStatsError}`,
        };
      }

      let issueStats = {
        reported_issues: 0,
        in_progress_issues: 0,
        resolved_issues: 0,
        overdue_issues: 0,
      };

      try {
        const { issues } = await apiClient.listIssues({ limit: 100, page: 1 });
        issueStats = {
          reported_issues: issues.filter((issue) => issue.status === 'reported').length,
          in_progress_issues: issues.filter((issue) => ['in_progress', 'assigned', 'escalated'].includes(issue.status)).length,
          resolved_issues: issues.filter((issue) => issue.status === 'resolved').length,
          overdue_issues: issues.filter((issue) => {
            if (!issue.updated_at) {
              return false;
            }

            const updatedAt = new Date(issue.updated_at).getTime();
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

            return ['reported', 'in_progress', 'assigned'].includes(issue.status) && updatedAt < weekAgo;
          }).length,
        };
      } catch (apiError) {
        return {
          success: false,
          error: `Could not load issues from API (${loadConfig().apiBaseUrl}): ${apiClient.formatApiError(apiError)}`,
        };
      }

      return {
        success: true,
        data: {
          ...adminStats,
          ...issueStats,
        },
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Recent issues
  ipcMain.handle('issues:getRecent', async () => {
    try {
      const { issues } = await apiClient.listIssues({ limit: 10, page: 1 });
      return { success: true, data: issues };
    } catch (err) {
      return {
        success: false,
        error: `Could not load issues from API (${loadConfig().apiBaseUrl}): ${apiClient.formatApiError(err)}`,
      };
    }
  });

  // Top workers
  ipcMain.handle('workers:getTop', async () => {
    try {
      const workers = await apiClient.getTopWorkers(5);
      return { success: true, data: workers };
    } catch (err) {
      return {
        success: false,
        error: `Could not load workers from API (${loadConfig().apiBaseUrl}): ${apiClient.formatApiError(err)}`,
      };
    }
  });

  // Workers list
  ipcMain.handle('workers:list', async (event, { search, department, status, page = 1, limit = 10 }) => {
    try {
      const data = await apiClient.listWorkers({ search, department, status, page, limit });
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: `Could not load workers from API (${loadConfig().apiBaseUrl}): ${apiClient.formatApiError(err)}`,
      };
    }
  });

  ipcMain.handle('workers:create', async (event, worker) => {
    try {
      const data = await apiClient.createWorker(worker);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  ipcMain.handle('workers:update', async (event, { id, worker }) => {
    try {
      await apiClient.updateWorker(id, worker);
      return { success: true };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  ipcMain.handle('workers:delete', async (event, id) => {
    try {
      await apiClient.deleteWorker(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  ipcMain.handle('workers:toggleStatus', async (event, id) => {
    try {
      const data = await apiClient.toggleWorkerStatus(id);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  // Departments
  ipcMain.handle('departments:list', async () => {
    try {
      const departments = await apiClient.listDepartments();
      return { success: true, data: departments };
    } catch (err) {
      return {
        success: false,
        error: `Could not load departments from API (${loadConfig().apiBaseUrl}): ${apiClient.formatApiError(err)}`,
      };
    }
  });

  ipcMain.handle('departments:create', async (event, dept) => {
    try {
      const data = await apiClient.createDepartment(dept);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  ipcMain.handle('departments:update', async (event, { id, dept }) => {
    try {
      await apiClient.updateDepartment(id, dept);
      return { success: true };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  ipcMain.handle('departments:delete', async (event, id) => {
    try {
      await apiClient.deleteDepartment(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  // Issues
  ipcMain.handle('issues:list', async (event, { search, status, page = 1, limit = 10 }) => {
    try {
      const data = await apiClient.listIssues({ search, status, page, limit });
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: `Could not load issues from API (${loadConfig().apiBaseUrl}): ${apiClient.formatApiError(err)}`,
      };
    }
  });

  ipcMain.handle('issues:getDetail', async (event, id) => {
    try {
      const data = await apiClient.getIssueDetail(id);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  ipcMain.handle('issues:assign', async (event, { id, assignment }) => {
    try {
      const data = await apiClient.assignIssue(id, assignment);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });

  ipcMain.handle('issues:update', async (event, { id, issue }) => {
    try {
      await apiClient.updateIssue(id, issue);
      return { success: true };
    } catch (err) {
      return { success: false, error: apiClient.formatApiError(err) };
    }
  });
}

module.exports = { setupIPC };
