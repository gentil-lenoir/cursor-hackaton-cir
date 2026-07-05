import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seed = JSON.parse(readFileSync(join(__dirname, 'dev-api-seed.json'), 'utf8'))

const state = {
  issues: seed.issues.map((issue) => ({ ...issue })),
  comments: structuredClone(seed.comments),
  activity: structuredClone(seed.activity),
  workers: seed.workers.map((worker) => ({ ...worker })),
  tasks: seed.tasks.map((task) => ({ ...task })),
  flaggedComments: seed.flagged_comments.map((item) => ({ ...item })),
  settings: structuredClone(seed.settings),
  taskSteps: structuredClone(seed.task_steps ?? {}),
  taskComments: structuredClone(seed.task_comments ?? {}),
  bannedCommentUsers: new Set(),
  tokens: new Map(),
  otps: new Map(),
  nextTaskId: 103,
  nextWorkerId: 5,
  nextTaskStepId: 20,
  nextTaskCommentId: 10,
  nextActivityId: 100
}

const PORT = Number(process.env.PORT ?? 8000)
const HOST = process.env.HOST ?? '0.0.0.0'

function ok(data, message = 'Success', status = 200) {
  return { status, body: { data, message } }
}

function fail(message, status = 400) {
  return { status, body: { message } }
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.status,
    language: user.language
  }
}

function authUser(req) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token || !state.tokens.has(token)) return null
  return state.tokens.get(token)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (chunks.length === 0) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

function filterIssues(params) {
  let results = [...state.issues]
  if (params.status) results = results.filter((issue) => issue.status === params.status)
  if (params.district) {
    const q = params.district.toLowerCase()
    results = results.filter((issue) => issue.district.toLowerCase().includes(q))
  }
  if (params.search) {
    const q = params.search.toLowerCase()
    results = results.filter(
      (issue) =>
        issue.title.toLowerCase().includes(q) ||
        issue.reference_number.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q)
    )
  }
  return results.sort((a, b) => b.final_priority - a.final_priority)
}

function analyticsOverview() {
  const open = state.issues.filter((i) => !['resolved', 'closed', 'rejected'].includes(i.status))
  const resolvedThisMonth = state.issues.filter(
    (i) => i.status === 'resolved' && i.resolved_at?.startsWith('2026-07')
  )
  const districtMap = new Map()
  const categoryMap = new Map()
  for (const issue of state.issues) {
    districtMap.set(issue.district, (districtMap.get(issue.district) ?? 0) + 1)
    if (issue.ai_category) {
      categoryMap.set(issue.ai_category, (categoryMap.get(issue.ai_category) ?? 0) + 1)
    }
  }
  return {
    total_open_issues: open.length,
    resolved_this_month: resolvedThisMonth.length,
    avg_resolution_days: 6.5,
    active_workers: state.workers.filter((w) => w.status === 'active').length,
    issues_by_district: [...districtMap.entries()].map(([district, count]) => ({ district, count })),
    issues_by_category: [...categoryMap.entries()].map(([category, count]) => ({ category, count }))
  }
}

function appendActivity(issueId, action, userId = 1, metadata = null) {
  const key = String(issueId)
  const entry = {
    id: state.nextActivityId++,
    user_id: userId,
    action,
    metadata,
    created_at: new Date().toISOString()
  }
  state.activity[key] = [...(state.activity[key] ?? []), entry]
}

function formatTaskDetail(task) {
  return {
    ...task,
    steps: state.taskSteps[String(task.id)] ?? [],
    comments: state.taskComments[String(task.id)] ?? []
  }
}

async function route(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const method = req.method ?? 'GET'

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')

  if (method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  try {
    let result = null

    if (method === 'GET' && path === '/up') {
      result = ok({ status: 'ok' })
    } else if (method === 'POST' && path === '/api/v1/auth/login') {
      const body = await readBody(req)
      if (body.email !== seed.admin.email || body.password !== seed.admin.password) {
        result = fail('Incorrect email or password.', 422)
      } else {
        const token = randomUUID()
        state.tokens.set(token, seed.admin)
        result = ok({ token, user: formatUser(seed.admin) })
      }
    } else if (method === 'POST' && path === '/api/v1/auth/otp/request') {
      const body = await readBody(req)
      if (body.phone !== seed.admin.phone) {
        result = fail('Phone number not registered as admin.', 422)
      } else {
        state.otps.set(body.phone, '123456')
        result = ok({ sent: true }, 'OTP sent.')
      }
    } else if (method === 'POST' && path === '/api/v1/auth/otp/verify') {
      const body = await readBody(req)
      if (state.otps.get(body.phone) !== body.code) {
        result = fail('Invalid or expired OTP code.', 422)
      } else {
        state.otps.delete(body.phone)
        const token = randomUUID()
        state.tokens.set(token, seed.admin)
        result = ok({ token, user: formatUser(seed.admin) })
      }
    } else if (method === 'GET' && path === '/api/v1/auth/me') {
      const user = authUser(req)
      result = user ? ok(formatUser(user)) : fail('Unauthenticated.', 401)
    } else if (method === 'POST' && path === '/api/v1/auth/logout') {
      const header = req.headers.authorization ?? ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : null
      if (token) state.tokens.delete(token)
      result = ok(null, 'Logged out.')
    } else if (path.startsWith('/api/v1/admin/') || path.startsWith('/api/v1/issues/')) {
      const user = authUser(req)
      if (!user) {
        result = fail('Unauthenticated.', 401)
      } else if (method === 'GET' && path === '/api/v1/admin/issues') {
        result = ok(filterIssues(Object.fromEntries(url.searchParams)))
      } else if (method === 'GET' && /^\/api\/v1\/admin\/issues\/\d+$/.test(path)) {
        const id = Number(path.split('/').pop())
        const issue = state.issues.find((item) => item.id === id)
        result = issue ? ok(issue) : fail('Issue not found.', 404)
      } else if (method === 'PATCH' && /^\/api\/v1\/admin\/issues\/\d+$/.test(path)) {
        const id = Number(path.split('/').pop())
        const body = await readBody(req)
        const index = state.issues.findIndex((item) => item.id === id)
        if (index === -1) {
          result = fail('Issue not found.', 404)
        } else {
          const current = state.issues[index]
          if (body.status && body.status !== current.status) {
            appendActivity(id, `Status changed to ${body.status}`, 1, {
              from: current.status,
              to: body.status
            })
          }
          if (body.admin_priority_override !== undefined) {
            appendActivity(id, `Priority override set to ${body.admin_priority_override}`, 1, {
              admin_priority_override: body.admin_priority_override
            })
          }
          state.issues[index] = {
            ...current,
            status: body.status ?? current.status,
            admin_priority_override:
              body.admin_priority_override !== undefined
                ? body.admin_priority_override
                : current.admin_priority_override,
            final_priority: body.admin_priority_override ?? current.final_priority,
            updated_at: new Date().toISOString()
          }
          result = ok(state.issues[index])
        }
      } else if (method === 'GET' && /^\/api\/v1\/admin\/issues\/\d+\/activity$/.test(path)) {
        const id = path.split('/')[5]
        result = ok(state.activity[id] ?? [])
      } else if (method === 'GET' && /^\/api\/v1\/issues\/\d+\/comments$/.test(path)) {
        const id = path.split('/')[4]
        result = ok(state.comments[id] ?? [])
      } else if (method === 'GET' && path === '/api/v1/admin/tasks') {
        result = ok(state.tasks)
      } else if (method === 'POST' && path === '/api/v1/admin/tasks') {
        const body = await readBody(req)
        const issue = state.issues.find((item) => item.id === body.issue_id)
        const worker = state.workers.find((item) => item.id === body.assigned_to)
        if (!issue || !worker || worker.status !== 'active') {
          result = fail('Invalid issue or worker.', 422)
        } else {
          const task = {
            id: state.nextTaskId++,
            issue_id: issue.id,
            issue_title: issue.title,
            issue_reference: issue.reference_number,
            district: issue.district,
            assigned_to: worker.id,
            assigned_to_name: worker.name,
            title: `Task for ${issue.reference_number}`,
            admin_notes: body.admin_notes ?? null,
            status: 'todo',
            due_date: body.due_date ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          state.tasks.unshift(task)
          worker.active_task_count = (worker.active_task_count ?? 0) + 1
          state.taskSteps[String(task.id)] = (body.steps ?? []).map((title, index) => ({
            id: state.nextTaskStepId++,
            title,
            description: null,
            order: index + 1,
            is_completed: false,
            completed_at: null
          }))
          state.taskComments[String(task.id)] = []
          const issueIndex = state.issues.findIndex((item) => item.id === issue.id)
          state.issues[issueIndex] = { ...state.issues[issueIndex], status: 'assigned' }
          appendActivity(issue.id, `Task assigned to ${worker.name}`, 1, {
            task_id: task.id,
            worker_id: worker.id,
            steps: body.steps ?? []
          })
          result = ok(task)
        }
      } else if (method === 'GET' && path === '/api/v1/admin/workers') {
        result = ok(state.workers)
      } else if (method === 'GET' && path === '/api/v1/admin/analytics/overview') {
        result = ok(analyticsOverview())
      } else if (method === 'GET' && path === '/api/v1/admin/moderation/comments') {
        result = ok(state.flaggedComments)
      } else if (method === 'POST' && /^\/api\/v1\/admin\/moderation\/comments\/\d+\/approve$/.test(path)) {
        const id = Number(path.split('/')[6])
        const index = state.flaggedComments.findIndex((item) => item.id === id)
        if (index === -1) {
          result = fail('Comment not found.', 404)
        } else {
          state.flaggedComments.splice(index, 1)
          result = ok(null, 'Flags dismissed.')
        }
      } else if (method === 'DELETE' && /^\/api\/v1\/admin\/moderation\/comments\/\d+$/.test(path)) {
        const id = Number(path.split('/').pop())
        const index = state.flaggedComments.findIndex((item) => item.id === id)
        if (index === -1) {
          result = fail('Comment not found.', 404)
        } else {
          state.flaggedComments.splice(index, 1)
          result = ok(null, 'Comment deleted.')
        }
      } else if (method === 'POST' && /^\/api\/v1\/admin\/moderation\/users\/\d+\/ban-comments$/.test(path)) {
        const userId = Number(path.split('/')[6])
        state.bannedCommentUsers.add(userId)
        for (const comment of state.flaggedComments) {
          if (comment.user_id === userId) {
            comment.comment_banned = true
          }
        }
        result = ok(null, 'User banned from commenting.')
      } else if (method === 'GET' && path === '/api/v1/admin/settings') {
        result = ok(state.settings)
      } else if (method === 'PATCH' && path === '/api/v1/admin/settings') {
        const body = await readBody(req)
        if (body.priority_weights) {
          const sum =
            body.priority_weights.citizen + body.priority_weights.ai + body.priority_weights.community
          if (Math.abs(sum - 1) > 0.001) {
            result = fail('Priority weights must sum to 1.0.', 422)
          } else {
            state.settings.priority_weights = { ...body.priority_weights }
          }
        }
        if (!result) {
          if (body.ai_prompt_template !== undefined) {
            state.settings.ai_prompt_template = body.ai_prompt_template
          }
          if (body.notification_templates) {
            state.settings.notification_templates = { ...body.notification_templates }
          }
          if (body.districts) {
            state.settings.districts = [...body.districts]
          }
          result = ok(state.settings, 'Settings saved.')
        }
      } else if (method === 'PATCH' && path === '/api/v1/admin/issues/bulk') {
        const body = await readBody(req)
        const updated = (body.issue_ids ?? []).map((issueId) => {
          const index = state.issues.findIndex((item) => item.id === issueId)
          if (index === -1) return null
          state.issues[index] = {
            ...state.issues[index],
            status: body.status,
            updated_at: new Date().toISOString()
          }
          appendActivity(issueId, `Bulk status changed to ${body.status}`, 1)
          return state.issues[index]
        }).filter(Boolean)
        result = ok(updated)
      } else if (method === 'POST' && /^\/api\/v1\/admin\/issues\/\d+\/public-note$/.test(path)) {
        const issueId = Number(path.split('/')[5])
        const body = await readBody(req)
        appendActivity(issueId, `Public resolution note: ${body.body}`, 1, { public_note: body.body })
        result = ok(null, 'Public note added.')
      } else if (method === 'GET' && /^\/api\/v1\/admin\/tasks\/\d+$/.test(path)) {
        const id = Number(path.split('/').pop())
        const task = state.tasks.find((item) => item.id === id)
        result = task ? ok(formatTaskDetail(task)) : fail('Task not found.', 404)
      } else if (method === 'PATCH' && /^\/api\/v1\/admin\/tasks\/\d+$/.test(path)) {
        const id = Number(path.split('/').pop())
        const body = await readBody(req)
        const index = state.tasks.findIndex((item) => item.id === id)
        if (index === -1) {
          result = fail('Task not found.', 404)
        } else {
          const current = state.tasks[index]
          let assignedToName = current.assigned_to_name
          if (body.assigned_to && body.assigned_to !== current.assigned_to) {
            const oldWorker = state.workers.find((w) => w.id === current.assigned_to)
            const newWorker = state.workers.find((w) => w.id === body.assigned_to)
            if (!newWorker || newWorker.status !== 'active') {
              result = fail('Invalid worker.', 422)
            } else {
              if (oldWorker) oldWorker.active_task_count = Math.max(0, (oldWorker.active_task_count ?? 0) - 1)
              newWorker.active_task_count = (newWorker.active_task_count ?? 0) + 1
              assignedToName = newWorker.name
            }
          }
          if (!result) {
            state.tasks[index] = {
              ...current,
              status: body.status ?? current.status,
              assigned_to: body.assigned_to ?? current.assigned_to,
              assigned_to_name: assignedToName,
              due_date: body.due_date !== undefined ? body.due_date : current.due_date,
              admin_notes: body.admin_notes !== undefined ? body.admin_notes : current.admin_notes,
              updated_at: new Date().toISOString()
            }
            result = ok(formatTaskDetail(state.tasks[index]))
          }
        }
      } else if (method === 'DELETE' && /^\/api\/v1\/admin\/tasks\/\d+$/.test(path)) {
        const id = Number(path.split('/').pop())
        const index = state.tasks.findIndex((item) => item.id === id)
        if (index === -1) {
          result = fail('Task not found.', 404)
        } else {
          const task = state.tasks[index]
          const worker = state.workers.find((w) => w.id === task.assigned_to)
          if (worker) worker.active_task_count = Math.max(0, (worker.active_task_count ?? 0) - 1)
          state.tasks.splice(index, 1)
          delete state.taskSteps[String(id)]
          delete state.taskComments[String(id)]
          result = ok(null, 'Task deleted.')
        }
      } else if (method === 'POST' && /^\/api\/v1\/admin\/tasks\/\d+\/approve$/.test(path)) {
        const id = Number(path.split('/')[5])
        const index = state.tasks.findIndex((item) => item.id === id)
        if (index === -1) {
          result = fail('Task not found.', 404)
        } else {
          state.tasks[index] = { ...state.tasks[index], status: 'done', updated_at: new Date().toISOString() }
          const issueIndex = state.issues.findIndex((i) => i.id === state.tasks[index].issue_id)
          if (issueIndex !== -1) {
            state.issues[issueIndex] = {
              ...state.issues[issueIndex],
              status: 'resolved',
              resolved_at: new Date().toISOString()
            }
          }
          result = ok(formatTaskDetail(state.tasks[index]))
        }
      } else if (method === 'POST' && /^\/api\/v1\/admin\/tasks\/\d+\/reject$/.test(path)) {
        const id = Number(path.split('/')[5])
        const index = state.tasks.findIndex((item) => item.id === id)
        if (index === -1) {
          result = fail('Task not found.', 404)
        } else {
          state.tasks[index] = { ...state.tasks[index], status: 'in_progress', updated_at: new Date().toISOString() }
          result = ok(formatTaskDetail(state.tasks[index]))
        }
      } else if (method === 'POST' && /^\/api\/v1\/admin\/tasks\/\d+\/comments$/.test(path)) {
        const id = Number(path.split('/')[5])
        const body = await readBody(req)
        const key = String(id)
        const comment = {
          id: state.nextTaskCommentId++,
          user_id: 1,
          author_name: seed.admin.name,
          body: body.body,
          type: body.type ?? 'comment',
          created_at: new Date().toISOString()
        }
        state.taskComments[key] = [...(state.taskComments[key] ?? []), comment]
        result = ok(comment)
      } else if (method === 'POST' && path === '/api/v1/admin/workers/invite') {
        const body = await readBody(req)
        if (state.workers.some((w) => w.phone === body.phone)) {
          result = fail('Phone number already registered.', 422)
        } else {
          const worker = {
            id: state.nextWorkerId++,
            name: body.name,
            phone: body.phone,
            status: 'invited',
            active_task_count: 0
          }
          state.workers.push(worker)
          result = ok(worker, 'Invite sent.')
        }
      } else if (method === 'PATCH' && /^\/api\/v1\/admin\/workers\/\d+$/.test(path)) {
        const id = Number(path.split('/').pop())
        const body = await readBody(req)
        const index = state.workers.findIndex((w) => w.id === id)
        if (index === -1) {
          result = fail('Worker not found.', 404)
        } else {
          state.workers[index] = { ...state.workers[index], status: body.status }
          result = ok(state.workers[index])
        }
      }
    }

    if (!result) {
      result = fail('Not found.', 404)
    }

    res.writeHead(result.status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result.body))
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: error instanceof Error ? error.message : 'Server error' }))
  }
}

createServer(route).listen(PORT, HOST, () => {
  console.log(`CIR dev API listening on http://${HOST}:${PORT}`)
  console.log('Login: admin@cir.rw / password')
})
