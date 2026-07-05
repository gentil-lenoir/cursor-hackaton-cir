let currentTab = 'dashboard';
let currentWorkerId = null;
let currentDepartmentId = null;
let currentIssueId = null;
let currentAssignWorkerId = null;

// Tab navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const tab = link.dataset.tab;
        switchTab(tab);
        updateHeader(tab);
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
    document.querySelector(`[data-section="${tabName}"]`).classList.add('active');

    currentTab = tabName;

    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'workers') {
        loadWorkers();
    } else if (tabName === 'issues') {
        loadIssues();
    } else if (tabName === 'departments') {
        loadDepartments();
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
async function loadDashboard() {
    try {
        const statsResult = await window.electronAPI.getDashboardStats();
        if (statsResult.success) {
            const stats = statsResult.data;
            const cards = document.querySelectorAll('.stat-card');
            cards[0].querySelector('.stat-value').textContent = stats.workers;
            cards[0].querySelector('.stat-meta').textContent = `${stats.active_workers} active`;
            cards[1].querySelector('.stat-value').textContent = stats.departments;
            cards[2].querySelector('.stat-value').textContent = stats.reported_issues + stats.in_progress_issues;
            cards[2].querySelector('.stat-meta').textContent = `${stats.resolved_issues} resolved`;
            cards[3].querySelector('.stat-value').textContent = stats.overdue_issues;
        } else {
            console.error('Dashboard stats error:', statsResult.error);
        }

        const issuesResult = await window.electronAPI.getRecentIssues();
        if (issuesResult.success) {
            const container = document.getElementById('recentIssuesContainer');
            const issues = issuesResult.data;
            if (issues.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>No issues yet</p></div>';
            } else {
                let html = '<table style="width: 100%;"><tbody>';
                issues.forEach(issue => {
                    html += `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 12px;">
                                <p style="font-weight: bold; margin: 0;">${issue.title}</p>
                                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${issue.category || 'General'}</p>
                            </td>
                            <td style="padding: 12px; color: #64748b; font-size: 12px;">
                                ${issue.worker_name || 'Unassigned'}
                            </td>
                            <td style="padding: 12px;">
                                <span class="badge badge-${issue.status}">${formatStatus(issue.status)}</span>
                            </td>
                        </tr>
                    `;
                });
                html += '</tbody></table>';
                container.innerHTML = html;
            }
        } else {
            const container = document.getElementById('recentIssuesContainer');
            container.innerHTML = `<div class="empty-state"><p style="color:#b91c1c;">${issuesResult.error || 'Could not load issues'}</p></div>`;
        }

        const workersResult = await window.electronAPI.getTopWorkers();
        if (workersResult.success) {
            const container = document.getElementById('topWorkersContainer');
            const workers = workersResult.data;
            if (workers.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>No workers yet</p></div>';
            } else {
                let html = '';
                workers.forEach(worker => {
                    html += `
                        <div style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <p style="font-weight: bold; margin: 0;">${worker.name}</p>
                                    <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${worker.department_name || 'No dept'}</p>
                                </div>
                                <span style="background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                                    ${worker.issues_count} issues
                                </span>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
        }
    } catch (err) {
        console.error('Dashboard load error:', err);
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
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No workers found</td></tr>';
            } else {
                result.data.workers.forEach(worker => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${worker.name}</td>
                        <td style="font-size: 12px; color: #64748b;">${worker.email}</td>
                        <td>${worker.department_name || '-'}</td>
                        <td><span class="badge badge-${worker.status}">${worker.status}</span></td>
                        <td><span class="badge badge-${worker.availability_status === 'available' ? 'resolved' : 'in-progress'}">${worker.availability_status}</span></td>
                        <td>
                            <button class="btn btn-primary" style="font-size: 11px; padding: 6px 12px;" onclick="openWorkerAssignModal(${worker.id})">Assign</button>
                            <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;" onclick="editWorker(${worker.id})">Edit</button>
                            <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;" onclick="deleteWorker(${worker.id})">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
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
        const search = document.getElementById('issueSearch')?.value.trim() || '';
        const status = document.getElementById('issueStatusFilter')?.value || '';
        const result = await window.electronAPI.listIssues({ search, status, page: 1, limit: 50 });
        const tbody = document.getElementById('issuesBody');
        tbody.innerHTML = '';

        if (!result.success) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #b91c1c;">${result.error || 'Failed to load issues from API'}</td></tr>`;
            return;
        }

        if (result.data.issues.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No issues found</td></tr>';
            return;
        }

        result.data.issues.forEach(issue => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <p style="font-weight: 600; margin: 0;">${escapeHtml(issue.title)}</p>
                    <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">${escapeHtml(issue.reporter_name || 'Unknown reporter')}${issue.address ? ` · ${escapeHtml(issue.address)}` : ''}</p>
                </td>
                <td style="font-size: 12px; color: #64748b;">${escapeHtml(issue.category || '-')}</td>
                <td>${escapeHtml(issue.worker_name || 'Unassigned')}</td>
                <td><span class="badge badge-${issue.status}">${formatStatus(issue.status)}</span></td>
                <td style="font-size: 12px; color: #64748b;">${formatDate(issue.created_at)}</td>
                <td>
                    <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;" onclick="viewIssue(${issue.id})">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Issues load error:', err);
        const tbody = document.getElementById('issuesBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #b91c1c;">${err.message}</td></tr>`;
        }
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
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">No departments found</td></tr>';
            } else {
                result.data.forEach(dept => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${dept.name}</td>
                        <td style="font-size: 12px; color: #64748b;">${dept.description || '-'}</td>
                        <td>${dept.workers_count ?? 0}</td>
                        <td>
                            <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;" onclick="editDepartment(${dept.id})">Edit</button>
                            <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;" onclick="deleteDepartment(${dept.id})">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    } catch (err) {
        console.error('Departments load error:', err);
    }
}

function editDepartment(id) {
    currentDepartmentId = id;
    // Fetch and populate form (simplified for now)
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
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

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
document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'add-worker') {
            currentWorkerId = null;
            document.getElementById('workerForm').reset();
            openModal('workerModal');
        } else if (action === 'add-department') {
            currentDepartmentId = null;
            document.getElementById('departmentForm').reset();
            openModal('departmentModal');
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

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function viewIssue(id) {
    openIssueModal(id);
}

async function openIssueModal(id) {
    currentIssueId = id;
    openModal('issueModal');

    document.getElementById('issueModalLoading').style.display = 'block';
    document.getElementById('issueModalContent').style.display = 'none';
    document.getElementById('issueAssignFeedback').className = 'feedback-message';
    document.getElementById('issueAssignFeedback').textContent = '';

    try {
        const [issueResult, workersResult] = await Promise.all([
            window.electronAPI.getIssueDetail(id),
            window.electronAPI.listWorkers({ page: 1, limit: 100, status: 'active' }),
        ]);

        if (!issueResult.success) {
            alert('Error loading issue: ' + issueResult.error);
            closeModal('issueModal');
            return;
        }

        populateIssueModal(issueResult.data, workersResult.success ? workersResult.data.workers : []);
    } catch (err) {
        alert('Error: ' + err.message);
        closeModal('issueModal');
    }
}

function populateIssueModal(issue, workers) {
    document.getElementById('issueModalTitle').textContent = issue.title;
    document.getElementById('issueModalSubtitle').textContent = `Issue #${issue.id}`;

    const statusEl = document.getElementById('issueDetailStatus');
    statusEl.textContent = formatStatus(issue.status);
    statusEl.className = `badge badge-${issue.status.replace('_', '-')}`;

    const priorityEl = document.getElementById('issueDetailPriority');
    priorityEl.textContent = issue.priority ? formatStatus(issue.priority) : '-';
    priorityEl.className = issue.priority ? `badge badge-${issue.priority}` : 'badge';

    document.getElementById('issueDetailCategory').textContent = issue.category || '-';
    document.getElementById('issueDetailReported').textContent = formatDate(issue.reported_at || issue.created_at);
    document.getElementById('issueDetailReporter').textContent = issue.reporter_name || 'Unknown';
    document.getElementById('issueDetailLocation').textContent = issue.address || '-';
    document.getElementById('issueDetailWorker').textContent = issue.worker_name
        ? `${issue.worker_name}${issue.department_name ? ` (${issue.department_name})` : ''}`
        : 'Unassigned';
    document.getElementById('issueDetailDeadline').textContent = issue.deadline ? formatDate(issue.deadline) : '-';
    document.getElementById('issueDetailDescription').textContent = issue.description || '-';

    document.getElementById('issueDetailStats').innerHTML = `
        <span>👍 ${issue.likes_count} likes</span>
        <span>👎 ${issue.dislikes_count} dislikes</span>
        <span>💬 ${issue.comments_count} comments</span>
    `;

    const imagesContainer = document.getElementById('issueDetailImages');
    if (issue.images && issue.images.length > 0) {
        imagesContainer.innerHTML = issue.images
            .map((img) => `<img src="${escapeHtml(img.url)}" alt="Issue image">`)
            .join('');
        imagesContainer.style.display = 'flex';
    } else {
        imagesContainer.innerHTML = '';
        imagesContainer.style.display = 'none';
    }

    const workerSelect = document.getElementById('issueAssignWorker');
    workerSelect.innerHTML = '<option value="">Select a worker...</option>';
    workers.forEach((worker) => {
        const selected = issue.worker_id === worker.id ? ' selected' : '';
        workerSelect.innerHTML += `<option value="${worker.id}"${selected}>${escapeHtml(worker.name)}${worker.department_name ? ` — ${escapeHtml(worker.department_name)}` : ''}</option>`;
    });

    document.getElementById('issueAssignDeadline').value = issue.deadline || defaultDeadlineDate();
    document.getElementById('issueAssignStatus').value = normalizeIssueStatus(issue.status);
    document.getElementById('issueAssignPriority').value = issue.priority || 'medium';
    document.getElementById('issueAssignSubmit').textContent = issue.worker_id ? 'Update Assignment' : 'Assign';

    document.getElementById('issueModalLoading').style.display = 'none';
    document.getElementById('issueModalContent').style.display = 'block';
}

function defaultDeadlineDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
}

function normalizeIssueStatus(status) {
    if (['reported', 'in_progress', 'resolved'].includes(status)) {
        return status;
    }

    return 'in_progress';
}

function showAssignFeedback(message, type) {
    const el = document.getElementById('issueAssignFeedback');
    el.textContent = message;
    el.className = `feedback-message ${type}`;
}

document.getElementById('issueAssignForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentIssueId) {
        return;
    }

    const assignment = {
        worker_id: document.getElementById('issueAssignWorker').value,
        deadline: document.getElementById('issueAssignDeadline').value,
        status: document.getElementById('issueAssignStatus').value,
        priority: document.getElementById('issueAssignPriority').value,
    };

    if (!assignment.worker_id) {
        showAssignFeedback('Please select a worker.', 'error');
        return;
    }

    const submitBtn = document.getElementById('issueAssignSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const result = await window.electronAPI.assignIssue(currentIssueId, assignment);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Assignment';

    if (result.success) {
        showAssignFeedback('Issue assigned successfully.', 'success');
        populateIssueModal(result.data, await loadActiveWorkers());
        loadIssues();
        if (currentTab === 'dashboard') {
            loadDashboard();
        }
    } else {
        showAssignFeedback(result.error || 'Assignment failed.', 'error');
    }
});

async function loadActiveWorkers() {
    const result = await window.electronAPI.listWorkers({ page: 1, limit: 100, status: 'active' });
    return result.success ? result.data.workers : [];
}

function showWorkerAssignFeedback(message, type) {
    const el = document.getElementById('workerAssignFeedback');
    el.textContent = message;
    el.className = `feedback-message ${type}`;
}

async function openWorkerAssignModal(workerId) {
    currentAssignWorkerId = workerId;

    const workersResult = await window.electronAPI.listWorkers({ page: 1, limit: 100 });
    const worker = workersResult.success
        ? workersResult.data.workers.find((w) => w.id === workerId)
        : null;
    const workerName = worker?.name || 'Worker';

    document.getElementById('workerAssignTitle').textContent = `Assign Task to ${workerName}`;
    document.getElementById('workerAssignSubtitle').textContent = 'Select an issue and set assignment details';
    document.getElementById('workerAssignFeedback').className = 'feedback-message';
    document.getElementById('workerAssignFeedback').textContent = '';
    document.getElementById('workerAssignDeadline').value = defaultDeadlineDate();
    document.getElementById('workerAssignStatus').value = 'in_progress';
    document.getElementById('workerAssignPriority').value = 'medium';

    openModal('workerAssignModal');
    document.getElementById('workerAssignLoading').style.display = 'block';
    document.getElementById('workerAssignContent').style.display = 'none';

    try {
        const result = await window.electronAPI.listIssues({ page: 1, limit: 100 });

        if (!result.success) {
            alert('Error loading issues: ' + result.error);
            closeModal('workerAssignModal');
            return;
        }

        const issueSelect = document.getElementById('workerAssignIssue');
        issueSelect.innerHTML = '<option value="">Select an issue...</option>';

        const assignableIssues = result.data.issues.filter((issue) => issue.status !== 'resolved');

        if (assignableIssues.length === 0) {
            issueSelect.innerHTML = '<option value="">No open issues available</option>';
            issueSelect.disabled = true;
        } else {
            issueSelect.disabled = false;
            assignableIssues.forEach((issue) => {
                const assignedLabel = issue.worker_name ? ` (assigned to ${issue.worker_name})` : ' (unassigned)';
                issueSelect.innerHTML += `<option value="${issue.id}">#${issue.id} — ${escapeHtml(issue.title)}${escapeHtml(assignedLabel)}</option>`;
            });
        }

        document.getElementById('workerAssignLoading').style.display = 'none';
        document.getElementById('workerAssignContent').style.display = 'block';
    } catch (err) {
        alert('Error: ' + err.message);
        closeModal('workerAssignModal');
    }
}

document.getElementById('workerAssignForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentAssignWorkerId) {
        return;
    }

    const issueId = document.getElementById('workerAssignIssue').value;
    if (!issueId) {
        showWorkerAssignFeedback('Please select an issue.', 'error');
        return;
    }

    const assignment = {
        worker_id: currentAssignWorkerId,
        deadline: document.getElementById('workerAssignDeadline').value,
        status: document.getElementById('workerAssignStatus').value,
        priority: document.getElementById('workerAssignPriority').value,
    };

    const submitBtn = document.getElementById('workerAssignSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Assigning...';

    const result = await window.electronAPI.assignIssue(Number(issueId), assignment);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Assign Task';

    if (result.success) {
        showWorkerAssignFeedback('Task assigned successfully.', 'success');
        loadWorkers();
        if (currentTab === 'issues') {
            loadIssues();
        }
        if (currentTab === 'dashboard') {
            loadDashboard();
        }
        setTimeout(() => closeModal('workerAssignModal'), 800);
    } else {
        showWorkerAssignFeedback(result.error || 'Assignment failed.', 'error');
    }
});

// Initial load
document.getElementById('issueSearch')?.addEventListener('input', () => {
    clearTimeout(window._issueSearchTimer);
    window._issueSearchTimer = setTimeout(loadIssues, 250);
});
document.getElementById('issueStatusFilter')?.addEventListener('change', loadIssues);

loadDashboard();
