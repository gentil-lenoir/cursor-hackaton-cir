const Database = require('better-sqlite3');
const path = require('node:path');
const { app } = require('electron');

let db = null;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'admin.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  createTables();
  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      theme_preference TEXT DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      department_id INTEGER,
      status TEXT DEFAULT 'active',
      availability_status TEXT DEFAULT 'available',
      theme_preference TEXT DEFAULT 'light',
      open_issues_count INTEGER DEFAULT 0,
      resolved_issues_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      status TEXT DEFAULT 'reported',
      user_id INTEGER,
      worker_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(worker_id) REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaults();
}

const DEFAULT_SETTINGS = {
  theme_preference: 'light',
  language: 'en',
  admin_name: 'Administrator',
  admin_email: 'admin@cir.rw',
  admin_phone: '+250788000000',
  notify_email: 'true',
  notify_sms: 'false',
  notify_new_issues: 'true',
  notify_escalations: 'true',
  notify_daily_summary: 'false',
  default_issue_priority: '3',
  escalation_days: '7',
  auto_assign_issues: 'false',
  municipality_name: 'Kigali Municipal Office',
  default_district: 'Kigali',
  districts: 'Kigali,Nyarugenge,Gasabo,Kicukiro',
  public_note_template: 'Your issue has been reviewed and updated by the municipal team.',
  api_base_url: 'http://127.0.0.1:8000/api',
  sync_on_startup: 'false',
};

function seedDefaults() {
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, value);
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    db.prepare(`
      INSERT INTO users (name, email, password, theme_preference)
      VALUES (?, ?, ?, ?)
    `).run('Administrator', 'admin@cir.rw', 'admin123', 'light');
  }
}

function getDatabase() {
  return db;
}

module.exports = { initDatabase, getDatabase, DEFAULT_SETTINGS };
