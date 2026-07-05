import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { to: '/inbox', label: 'Issue Inbox' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/workers', label: 'Workers' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/moderation', label: 'Moderation' },
  { to: '/settings', label: 'Settings' }
]

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    'block rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  ].join(' ')
}

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-6">
          <p className="text-xs uppercase tracking-widest text-sky-400">CIR Admin</p>
          <h1 className="mt-1 text-lg font-semibold">Citizen Issue Report</h1>
          <p className="mt-2 truncate text-sm text-slate-400">{user?.name}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
