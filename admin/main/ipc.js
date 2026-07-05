const { ipcMain } = require('electron');
const { getDatabase } = require('./db');
const apiClient = require('./api-client');
const { loadConfig } = require('./config');

function setupIPC() {
  // Dashboard stats
  ipcMain.handle('dashboard:getStats', async () => {
    const db = getDatabase();
    try {
      const local = {
        workers: db.prepare('SELECT COUNT(*) as count FROM workers').get().count,
        active_workers: db.prepare("SELECT COUNT(*) as count FROM workers WHERE status = 'active'").get().count,
        departments: db.prepare('SELECT COUNT(*) as count FROM departments').get().count,
      };

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
          error: `Could not load issues from API (${loadConfig().apiBaseUrl}): ${apiError.message}`,
        };
      }

      return {
        success: true,
        data: {
          ...local,
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
        error: `Could not load issues from API (${loadConfig().apiBaseUrl}): ${err.message}`,
      };
    }
  });

  // Top workers
  ipcMain.handle('workers:getTop', () => {
    const db = getDatabase();
    try {
      const workers = db.prepare(`
        SELECT w.*, d.name as department_name, COUNT(i.id) as issues_count
        FROM workers w
        LEFT JOIN departments d ON w.department_id = d.id
        LEFT JOIN issues i ON w.id = i.worker_id
        GROUP BY w.id
        ORDER BY issues_count DESC
        LIMIT 5
      `).all();
      return { success: true, data: workers };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Workers list
  ipcMain.handle('workers:list', (event, { search, department, status, page = 1, limit = 10 }) => {
    const db = getDatabase();
    try {
      let query = `
        SELECT w.*, d.name as department_name
        FROM workers w
        LEFT JOIN departments d ON w.department_id = d.id
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        query += ` AND (w.name LIKE ? OR w.email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (department) {
        query += ` AND w.department_id = ?`;
        params.push(department);
      }
      if (status) {
        query += ` AND w.status = ?`;
        params.push(status);
      }

      const offset = (page - 1) * limit;
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM workers w LEFT JOIN departments d ON w.department_id = d.id WHERE 1=1 ${search ? 'AND (w.name LIKE ? OR w.email LIKE ?)' : ''} ${department ? 'AND w.department_id = ?' : ''} ${status ? 'AND w.status = ?' : ''}`);
      const total = countStmt.get(...params).count;

      query += ` LIMIT ? OFFSET ?`;
      const stmt = db.prepare(query);
      const workers = stmt.all(...params, limit, offset);

      return { success: true, data: { workers, total, page, limit } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Worker CRUD
  ipcMain.handle('workers:create', (event, worker) => {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        INSERT INTO workers (name, email, phone, department_id, status, availability_status, theme_preference)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        worker.name,
        worker.email,
        worker.phone || null,
        worker.department_id || null,
        worker.status || 'active',
        worker.availability_status || 'available',
        worker.theme_preference || 'light'
      );
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('workers:update', (event, { id, worker }) => {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        UPDATE workers
        SET name = ?, email = ?, phone = ?, department_id = ?, status = ?, availability_status = ?, theme_preference = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        worker.name,
        worker.email,
        worker.phone || null,
        worker.department_id || null,
        worker.status,
        worker.availability_status,
        worker.theme_preference,
        id
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('workers:delete', (event, id) => {
    const db = getDatabase();
    try {
      db.prepare('DELETE FROM workers WHERE id = ?').run(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('workers:toggleStatus', (event, id) => {
    const db = getDatabase();
    try {
      const worker = db.prepare('SELECT status FROM workers WHERE id = ?').get(id);
      const newStatus = worker.status === 'active' ? 'inactive' : 'active';
      db.prepare('UPDATE workers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, id);
      return { success: true, data: { status: newStatus } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Departments
  ipcMain.handle('departments:list', () => {
    const db = getDatabase();
    try {
      const departments = db.prepare('SELECT * FROM departments ORDER BY name').all();
      return { success: true, data: departments };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('departments:create', (event, dept) => {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        INSERT INTO departments (name, description)
        VALUES (?, ?)
      `);
      const result = stmt.run(dept.name, dept.description || null);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('departments:update', (event, { id, dept }) => {
    const db = getDatabase();
    try {
      db.prepare('UPDATE departments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(dept.name, dept.description || null, id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('departments:delete', (event, id) => {
    const db = getDatabase();
    try {
      db.prepare('DELETE FROM departments WHERE id = ?').run(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
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
        error: `Could not load issues from API (${loadConfig().apiBaseUrl}): ${err.message}`,
      };
    }
  });

  ipcMain.handle('issues:update', async (event, { id, issue }) => {
    try {
      await apiClient.updateIssue(id, issue);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { setupIPC };
