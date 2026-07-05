let currentTab = 'dashboard';
let currentWorkerId = null;
let currentDepartmentId = null;
let appSettings = {};
let dashboardClockTimer = null;

const SIDEBAR_BREAKPOINT = 768;
const sidebarEl = document.querySelector('.sidebar');
const sidebarToggleEl = document.getElementById('sidebarToggle');
const sidebarBackdropEl = document.getElementById('sidebarBackdrop');

function isSmallScreen() {
    return window.innerWidth <= SIDEBAR_BREAKPOINT;
}

function setSidebarOpen(open) {
    if (!sidebarEl) return;

    sidebarEl.classList.toggle('open', open);
    sidebarBackdropEl?.classList.toggle('visible', open);
    document.body.classList.toggle('sidebar-open', open);

    if (sidebarToggleEl) {
        sidebarToggleEl.setAttribute('aria-expanded', open ? 'true' : 'false');
        sidebarToggleEl.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
}

function closeSidebar() {
    if (isSmallScreen()) {
        setSidebarOpen(false);
    }
}

function toggleSidebar() {
    if (!isSmallScreen()) return;
    setSidebarOpen(!sidebarEl.classList.contains('open'));
}

sidebarToggleEl?.addEventListener('click', toggleSidebar);
sidebarBackdropEl?.addEventListener('click', closeSidebar);

window.addEventListener('resize', () => {
    if (!isSmallScreen()) {
        setSidebarOpen(false);
    }
});

// Tab navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const tab = link.dataset.tab;
        switchTab(tab);
        updateHeader(tab);
        closeSidebar();
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const section = document.querySelector(`[data-section="${tabName}"]`);
    section.classList.add('active');
    window.CIRMotion?.pageTransition?.(section);

    currentTab = tabName;

    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'workers') {
        loadWorkers();
    } else if (tabName === 'issues') {
        loadIssues();
    } else if (tabName === 'departments') {
        loadDepartments();
    } else if (tabName === 'settings') {
        loadSettings();
    }
}

function updateHeader(tab) {
    const headers = {
        dashboard: { eyebrow: 'Municipal Manager', heading: 'Dashboard' },
        workers: { eyebrow: 'Admin / Workers', heading: 'Worker Management' },
        issues: { eyebrow: 'Admin / Issues', heading: 'Issue Management' },
        departments: { eyebrow: 'Admin / Departments', heading: 'Department Management' },
        settings: { eyebrow: 'Account', heading: 'Settings' }
    };

    const header = headers[tab] || headers.dashboard;
    document.querySelector('.header-eyebrow').textContent = header.eyebrow;
    document.querySelector('.header-heading').textContent = header.heading;
}

// DASHBOARD
function updateDashboardWelcome() {
    const name = appSettings.admin_name || 'Administrator';
    const municipality = appSettings.municipality_name || 'Municipal Office';
    const titleEl = document.getElementById('dashboardWelcomeTitle');
    const subEl = document.getElementById('dashboardWelcomeSub');
    if (titleEl) titleEl.textContent = `Welcome back, ${name.split(' ')[0]}`;
    if (subEl) subEl.textContent = `${municipality} — monitor issues, workers, and resolution progress.`;
}

function updateDashboardClock() {
    const now = new Date();
    const dateEl = document.getElementById('dashboardDate');
    const timeEl = document.getElementById('dashboardTime');
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}

function startDashboardClock() {
    updateDashboardClock();
    if (dashboardClockTimer) clearInterval(dashboardClockTimer);
    dashboardClockTimer = setInterval(updateDashboardClock, 60000);
}

function setStatValue(key, value) {
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (el) el.textContent = value;
}

function setStatMeta(key, text) {
    const el = document.querySelector(`[data-stat-meta="${key}"]`);
    if (el) el.textContent = text;
}

function renderBarChart(containerId, items, emptyLabel, labelKey = 'label') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>${emptyLabel}</p></div>`;
        return;
    }

    const max = Math.max(...items.map((item) => item.count), 1);
    container.innerHTML = items.map((item) => {
        const rawLabel = item[labelKey] || item.status || item.label || 'Unknown';
        const label = item.status ? formatStatus(item.status) : rawLabel;
        const pct = Math.round((item.count / max) * 100);
        return `
            <div class="chart-row">
                <div class="chart-row-header">
                    <strong>${label}</strong>
                    <span>${item.count}</span>
                </div>
                <div class="chart-track">
                    <div class="chart-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadDashboard() {
    try {
        updateDashboardWelcome();
        startDashboardClock();

        const statsResult = await window.electronAPI.getDashboardStats();
        if (statsResult.success) {
            const stats = statsResult.data;
            setStatValue('workers', stats.workers);
            setStatMeta('workers', `${stats.active_workers} active`);
            setStatValue('departments', stats.departments);
            setStatValue('open_issues', stats.open_issues ?? (stats.reported_issues + stats.in_progress_issues));
            setStatMeta('open_issues', `${stats.reported_issues} reported · ${stats.in_progress_issues} in progress`);
            setStatValue('resolved_issues', stats.resolved_issues);
            setStatMeta('resolved_issues', `${stats.resolution_rate ?? 0}% resolution rate`);
            setStatValue('overdue_issues', stats.overdue_issues);
            setStatValue('total_issues', stats.total_issues ?? 0);

            renderBarChart('statusChartContainer', stats.by_status, 'No issues recorded yet', 'status');
            renderBarChart('categoryChartContainer', stats.by_category, 'No categories yet');
            renderBarChart('departmentChartContainer', stats.by_department, 'No department data yet');
        }

        const issuesResult = await window.electronAPI.getRecentIssues();
        if (issuesResult.success) {
            const container = document.getElementById('recentIssuesContainer');
            const issues = issuesResult.data;
            if (issues.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>No issues yet</p></div>';
            } else {
                let html = '<table class="dashboard-table"><tbody>';
                issues.forEach((issue) => {
                    const statusClass = issue.status === 'in_progress' ? 'in-progress' : issue.status;
                    html += `
                        <tr>
                            <td>
                                <p class="m-0 font-semibold text-slate-900">${issue.title}</p>
                                <p class="mt-1 text-xs text-slate-500">${issue.category || 'General'} · ${formatDate(issue.created_at)}</p>
                            </td>
                            <td class="whitespace-nowrap text-right text-xs text-slate-500">
                                ${issue.worker_name || 'Unassigned'}
                            </td>
                            <td class="whitespace-nowrap text-right">
                                <span class="badge badge-${statusClass}">${formatStatus(issue.status)}</span>
                            </td>
                        </tr>
                    `;
                });
                html += '</tbody></table>';
                container.innerHTML = html;
            }
        }

        const workersResult = await window.electronAPI.getTopWorkers();
        if (workersResult.success) {
            const container = document.getElementById('topWorkersContainer');
            const workers = workersResult.data;
            if (workers.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>No workers yet</p></div>';
            } else {
                let html = '';
                workers.forEach((worker, index) => {
                    html += `
                        <div class="worker-rank">
                            <div class="worker-rank-badge">#${index + 1}</div>
                            <div class="min-w-0 flex-1">
                                <p class="m-0 font-semibold">${worker.name}</p>
                                <p class="mt-1 text-xs text-slate-500">${worker.department_name || 'No department'}</p>
                            </div>
                            <span class="whitespace-nowrap rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
                                ${worker.issues_count} issues
                            </span>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
        }
    } catch (err) {
        console.error('Dashboard load error:', err);
    } finally {
        window.CIRMotion?.animateWelcome?.();
        window.CIRMotion?.statCards?.();
        ['statusChartContainer', 'categoryChartContainer', 'departmentChartContainer'].forEach((id) => {
            window.CIRMotion?.chartContainer?.(document.getElementById(id));
        });
        window.CIRMotion?.listStagger?.(
            document.getElementById('recentIssuesContainer'),
            'tr'
        );
        window.CIRMotion?.listStagger?.(
            document.getElementById('topWorkersContainer'),
            '.worker-rank'
        );
    }
}

// WORKERS
async function loadWorkers() {
    try {
        // Load departments for filter
        const deptsResult = await window.electronAPI.listDepartments();
        if (deptsResult.success) {
            const filter = document.getElementById('workerDeptFilter');
            const deptSelect = document.getElementById('workerDept');
            filter.innerHTML = '<option value="">All departments</option>';
            deptSelect.innerHTML = '<option value="">No Department</option>';
            deptsResult.data.forEach(dept => {
                filter.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
                deptSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
            });
        }

        // Load workers
        const result = await window.electronAPI.listWorkers({ page: 1, limit: 50 });
        if (result.success) {
            const tbody = document.getElementById('workersBody');
            tbody.innerHTML = '';

            if (result.data.workers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="py-10 text-center">No workers found</td></tr>';
            } else {
                result.data.workers.forEach(worker => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${worker.name}</td>
                        <td class="text-xs text-slate-500">${worker.email}</td>
                        <td>${worker.department_name || '-'}</td>
                        <td><span class="badge badge-${worker.status}">${worker.status}</span></td>
                        <td><span class="badge badge-${worker.availability_status === 'available' ? 'resolved' : 'in-progress'}">${worker.availability_status}</span></td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="editWorker(${worker.id})">Edit</button>
                            <button class="btn btn-secondary btn-sm" onclick="deleteWorker(${worker.id})">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                window.CIRMotion?.listStagger?.(tbody, 'tr');
            }
        }
    } catch (err) {
        console.error('Workers load error:', err);
    }
}

async function editWorker(id) {
    const result = await window.electronAPI.listWorkers({ page: 1, limit: 50 });
    const worker = result.data.workers.find(w => w.id === id);
    if (worker) {
        currentWorkerId = id;
        document.getElementById('workerName').value = worker.name;
        document.getElementById('workerEmail').value = worker.email;
        document.getElementById('workerPhone').value = worker.phone || '';
        document.getElementById('workerDept').value = worker.department_id || '';
        setWorkerModalMode(true);
        openModal('workerModal');
    }
}

async function deleteWorker(id) {
    if (confirm('Delete this worker?')) {
        const result = await window.electronAPI.deleteWorker(id);
        if (result.success) {
            alert('Worker deleted');
            loadWorkers();
        } else {
            alert('Error: ' + result.error);
        }
    }
}

// ISSUES
async function loadIssues() {
    try {
        const result = await window.electronAPI.listIssues({ page: 1, limit: 50 });
        if (result.success) {
            const tbody = document.getElementById('issuesBody');
            tbody.innerHTML = '';

            if (result.data.issues.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="py-10 text-center">No issues found</td></tr>';
            } else {
                result.data.issues.forEach(issue => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${issue.title}</td>
                        <td class="text-xs text-slate-500">${issue.category || '-'}</td>
                        <td>${issue.worker_name || 'Unassigned'}</td>
                        <td><span class="badge badge-${issue.status === 'in_progress' ? 'in-progress' : issue.status}">${formatStatus(issue.status)}</span></td>
                        <td class="text-xs text-slate-500">${formatDate(issue.created_at)}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="viewIssue(${issue.id})">View</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                window.CIRMotion?.listStagger?.(tbody, 'tr');
            }
        }
    } catch (err) {
        console.error('Issues load error:', err);
    }
}

// DEPARTMENTS
async function loadDepartments() {
    try {
        const result = await window.electronAPI.listDepartments();
        if (result.success) {
            const tbody = document.getElementById('departmentsBody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="py-10 text-center">No departments found</td></tr>';
            } else {
                result.data.forEach(dept => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${dept.name}</td>
                        <td class="text-xs text-slate-500">${dept.description || '-'}</td>
                        <td>0</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="editDepartment(${dept.id})">Edit</button>
                            <button class="btn btn-secondary btn-sm" onclick="deleteDepartment(${dept.id})">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                window.CIRMotion?.listStagger?.(tbody, 'tr');
            }
        }
    } catch (err) {
        console.error('Departments load error:', err);
    }
}

function editDepartment(id) {
    currentDepartmentId = id;
    setDepartmentModalMode(true);
    openModal('departmentModal');
}

async function deleteDepartment(id) {
    if (confirm('Delete this department?')) {
        const result = await window.electronAPI.deleteDepartment(id);
        if (result.success) {
            alert('Department deleted');
            loadDepartments();
        } else {
            alert('Error: ' + result.error);
        }
    }
}

// MODALS
function setWorkerModalMode(isEdit) {
    const title = document.getElementById('workerModalTitle');
    const desc = document.getElementById('workerModalDesc');
    if (title) title.textContent = isEdit ? 'Edit Worker' : 'Add Worker';
    if (desc) {
        desc.textContent = isEdit
            ? 'Update worker details and department assignment.'
            : 'Create a new worker account and assign a department.';
    }
}

function setDepartmentModalMode(isEdit) {
    const title = document.getElementById('departmentModalTitle');
    const desc = document.getElementById('departmentModalDesc');
    if (title) title.textContent = isEdit ? 'Edit Department' : 'Add Department';
    if (desc) {
        desc.textContent = isEdit
            ? 'Update department name and description.'
            : 'Create a team to organize workers and issues.';
    }
}

function getOpenModal() {
    return document.querySelector('.modal-backdrop.active');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    window.CIRMotion?.modalEnter?.(modal);
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 120);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const finish = () => {
        modal.classList.remove('active');
        if (!getOpenModal()) {
            document.body.classList.remove('modal-open');
        }
    };

    if (window.CIRMotion?.ready) {
        window.CIRMotion.modalLeave(modal, finish);
    } else {
        finish();
    }
}

function closeAllModals() {
    const openModals = [...document.querySelectorAll('.modal-backdrop.active')];
    if (openModals.length === 0) return;

    openModals.forEach((modal) => {
        closeModal(modal.id);
    });
}

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
        closeModal(btn.dataset.closeModal);
    });
});

document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
            closeModal(backdrop.id);
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (getOpenModal()) {
            closeAllModals();
            return;
        }
        closeSidebar();
    }
});

// FORMS
document.getElementById('workerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const worker = {
        name: document.getElementById('workerName').value,
        email: document.getElementById('workerEmail').value,
        phone: document.getElementById('workerPhone').value,
        department_id: document.getElementById('workerDept').value || null
    };

    const result = currentWorkerId
        ? await window.electronAPI.updateWorker(currentWorkerId, worker)
        : await window.electronAPI.createWorker(worker);

    if (result.success) {
        alert('Worker saved');
        closeModal('workerModal');
        loadWorkers();
        currentWorkerId = null;
    } else {
        alert('Error: ' + result.error);
    }
});

document.getElementById('departmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dept = {
        name: document.getElementById('deptName').value,
        description: document.getElementById('deptDesc').value
    };

    const result = currentDepartmentId
        ? await window.electronAPI.updateDepartment(currentDepartmentId, dept)
        : await window.electronAPI.createDepartment(dept);

    if (result.success) {
        alert('Department saved');
        closeModal('departmentModal');
        loadDepartments();
        currentDepartmentId = null;
    } else {
        alert('Error: ' + result.error);
    }
});

// BUTTON ACTIONS
document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.goto;
        if (tab) {
            switchTab(tab);
            updateHeader(tab);
        }
    });
});

document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'add-worker') {
            currentWorkerId = null;
            document.getElementById('workerForm').reset();
            setWorkerModalMode(false);
            openModal('workerModal');
        } else if (action === 'add-department') {
            currentDepartmentId = null;
            document.getElementById('departmentForm').reset();
            setDepartmentModalMode(false);
            openModal('departmentModal');
        } else if (action === 'refresh-dashboard') {
            loadDashboard();
        }
    });
});

// UTILITIES
function formatStatus(status) {
    return status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function viewIssue(id) {
    alert('Issue view not yet implemented');
}

// SETTINGS
const BOOL_SETTING_FIELDS = [
    'notify_email',
    'notify_sms',
    'notify_new_issues',
    'notify_escalations',
    'notify_daily_summary',
    'auto_assign_issues',
    'sync_on_startup'
];

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
}

function setCheckbox(name, value) {
    const input = document.querySelector(`[name="${name}"]`);
    if (input) input.checked = value === 'true' || value === true;
}

function getSettingsFormPayload() {
    const form = document.getElementById('settingsForm');
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    BOOL_SETTING_FIELDS.forEach((key) => {
        payload[key] = document.querySelector(`[name="${key}"]`)?.checked ? 'true' : 'false';
    });

    return payload;
}

function populateSettingsForm(settings) {
    appSettings = { ...settings };
    Object.entries(settings).forEach(([key, value]) => {
        const field = document.querySelector(`[name="${key}"]`);
        if (!field) return;
        if (field.type === 'checkbox') {
            field.checked = value === 'true' || value === true;
        } else {
            field.value = value ?? '';
        }
    });

    applyTheme(settings.theme_preference || 'light');
    document.getElementById('sidebarAdminName').textContent = settings.admin_name || 'Administrator';
    document.getElementById('sidebarAdminEmail').textContent = settings.admin_email || '@admin';
    if (currentTab === 'dashboard') {
        updateDashboardWelcome();
    }
}

function showSettingsMessage(text, type) {
    const el = document.getElementById('settingsMessage');
    el.textContent = text;
    el.className = `settings-message ${type}`;
    setTimeout(() => {
        el.className = 'settings-message';
    }, 4000);
}

async function loadSettings() {
    try {
        const result = await window.electronAPI.getSettings();
        if (result.success) {
            populateSettingsForm(result.data);
        } else {
            showSettingsMessage(result.error || 'Failed to load settings.', 'error');
        }
    } catch (err) {
        console.error('Settings load error:', err);
        showSettingsMessage('Failed to load settings.', 'error');
    }
}

document.querySelectorAll('[data-settings-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
        const panelId = tab.dataset.settingsTab;
        document.querySelectorAll('.settings-tab').forEach((item) => item.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach((panel) => panel.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`[data-settings-panel="${panelId}"]`)?.classList.add('active');
    });
});

document.getElementById('themePreference')?.addEventListener('change', (event) => {
    applyTheme(event.target.value);
});

document.getElementById('settingsForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = getSettingsFormPayload();
    const result = await window.electronAPI.saveSettings(payload);
    if (result.success) {
        populateSettingsForm(payload);
        showSettingsMessage('Settings saved successfully.', 'success');
    } else {
        showSettingsMessage(result.error || 'Failed to save settings.', 'error');
    }
});

document.getElementById('changePasswordBtn')?.addEventListener('click', async () => {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    if (!currentPassword || !newPassword) {
        showSettingsMessage('Enter both current and new password.', 'error');
        return;
    }
    const result = await window.electronAPI.changePassword({ currentPassword, newPassword });
    if (result.success) {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        showSettingsMessage('Password updated successfully.', 'success');
    } else {
        showSettingsMessage(result.error || 'Failed to update password.', 'error');
    }
});

// Initial load
function bootApp() {
    loadSettings().then(() => {
        if (isSmallScreen()) {
            setSidebarOpen(false);
        }
        loadDashboard();
        window.CIRMotion?.pageTransition?.(document.querySelector('.section.active'));
    });
}

if (window.CIRMotion?.ready) {
    bootApp();
} else {
    window.addEventListener('cir-motion-ready', bootApp, { once: true });
}
