const { ipcMain } = require('electron');
const { getDatabase } = require('./db');

function setupIPC() {
  // Dashboard stats
  ipcMain.handle('dashboard:getStats', () => {
    const db = getDatabase();
    try {
      const stats = {
        workers: db.prepare('SELECT COUNT(*) as count FROM workers').get().count,
        active_workers: db.prepare("SELECT COUNT(*) as count FROM workers WHERE status = 'active'").get().count,
        departments: db.prepare('SELECT COUNT(*) as count FROM departments').get().count,
        reported_issues: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'reported'").get().count,
        in_progress_issues: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'").get().count,
        resolved_issues: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'").get().count,
        overdue_issues: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status IN ('reported', 'in_progress') AND julianday(updated_at) < julianday('now', '-7 days')").get().count,
        total_issues: db.prepare('SELECT COUNT(*) as count FROM issues').get().count,
      };
      stats.open_issues = stats.reported_issues + stats.in_progress_issues;
      stats.resolution_rate = stats.total_issues
        ? Math.round((stats.resolved_issues / stats.total_issues) * 100)
        : 0;

      const byStatus = db.prepare(`
        SELECT status, COUNT(*) as count FROM issues GROUP BY status ORDER BY count DESC
      `).all();

      const byCategory = db.prepare(`
        SELECT COALESCE(NULLIF(category, ''), 'General') as label, COUNT(*) as count
        FROM issues GROUP BY label ORDER BY count DESC LIMIT 6
      `).all();

      const byDepartment = db.prepare(`
        SELECT COALESCE(d.name, 'Unassigned') as label, COUNT(i.id) as count
        FROM issues i
        LEFT JOIN workers w ON i.worker_id = w.id
        LEFT JOIN departments d ON w.department_id = d.id
        GROUP BY label ORDER BY count DESC LIMIT 6
      `).all();

      return { success: true, data: { ...stats, by_status: byStatus, by_category: byCategory, by_department: byDepartment } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Recent issues
  ipcMain.handle('issues:getRecent', () => {
    const db = getDatabase();
    try {
      const issues = db.prepare(`
        SELECT i.*, w.name as worker_name, d.name as department_name
        FROM issues i
        LEFT JOIN workers w ON i.worker_id = w.id
        LEFT JOIN departments d ON w.department_id = d.id
        ORDER BY i.created_at DESC
        LIMIT 10
      `).all();
      return { success: true, data: issues };
    } catch (err) {
      return { success: false, error: err.message };
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
  ipcMain.handle('issues:list', (event, { search, status, page = 1, limit = 10 }) => {
    const db = getDatabase();
    try {
      let query = `
        SELECT i.*, w.name as worker_name, d.name as department_name
        FROM issues i
        LEFT JOIN workers w ON i.worker_id = w.id
        LEFT JOIN departments d ON w.department_id = d.id
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        query += ` AND (i.title LIKE ? OR i.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (status) {
        query += ` AND i.status = ?`;
        params.push(status);
      }

      const offset = (page - 1) * limit;
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM issues i WHERE 1=1 ${search ? 'AND (i.title LIKE ? OR i.description LIKE ?)' : ''} ${status ? 'AND i.status = ?' : ''}`);
      const total = countStmt.get(...params).count;

      query += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
      const stmt = db.prepare(query);
      const issues = stmt.all(...params, limit, offset);

      return { success: true, data: { issues, total, page, limit } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('issues:update', (event, { id, issue }) => {
    const db = getDatabase();
    try {
      db.prepare(`
        UPDATE issues
        SET title = ?, description = ?, category = ?, status = ?, worker_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(issue.title, issue.description, issue.category, issue.status, issue.worker_id || null, id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Settings
  ipcMain.handle('settings:get', () => {
    const db = getDatabase();
    const { DEFAULT_SETTINGS } = require('./db');
    try {
      const rows = db.prepare('SELECT key, value FROM settings').all();
      const settings = { ...DEFAULT_SETTINGS };
      rows.forEach((row) => {
        settings[row.key] = row.value;
      });

      const admin = db.prepare('SELECT id, name, email, theme_preference FROM users ORDER BY id LIMIT 1').get();
      if (admin) {
        settings.admin_name = admin.name;
        settings.admin_email = admin.email;
        settings.theme_preference = admin.theme_preference || settings.theme_preference;
      }

      return { success: true, data: settings };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:save', (event, payload) => {
    const db = getDatabase();
    try {
      const upsert = db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `);

      const accountKeys = ['admin_name', 'admin_email', 'theme_preference'];
      const settingsPayload = { ...payload };
      const admin = db.prepare('SELECT id FROM users ORDER BY id LIMIT 1').get();

      if (admin) {
        db.prepare(`
          UPDATE users
          SET name = ?, email = ?, theme_preference = ?
          WHERE id = ?
        `).run(
          settingsPayload.admin_name || 'Administrator',
          settingsPayload.admin_email || admin.email,
          settingsPayload.theme_preference || 'light',
          admin.id
        );
      }

      Object.entries(settingsPayload).forEach(([key, value]) => {
        if (accountKeys.includes(key)) return;
        upsert.run(key, String(value ?? ''));
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:changePassword', (event, { currentPassword, newPassword }) => {
    const db = getDatabase();
    try {
      const admin = db.prepare('SELECT id, password FROM users ORDER BY id LIMIT 1').get();
      if (!admin) {
        return { success: false, error: 'No admin account found.' };
      }
      if (admin.password !== currentPassword) {
        return { success: false, error: 'Current password is incorrect.' };
      }
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters.' };
      }
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, admin.id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { setupIPC };
