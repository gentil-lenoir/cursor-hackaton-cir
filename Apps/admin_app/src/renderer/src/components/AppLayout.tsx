import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

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
    'cir-nav-link block rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'cir-nav-link-active border-l-[3px] border-[#21d4b4] text-[#21d4b4]'
      : 'border-l-[3px] border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
  ].join(' ')
}

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="cir-page-bg flex min-h-screen text-slate-100">
      <aside className="cir-sidebar flex w-64 shrink-0 flex-col border-r border-white/10 bg-gradient-to-br from-[#0f172a] to-[#0a3e4a]">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#21d4b4] to-[#10b981] text-lg">
            🏛
          </div>
          <p className="cir-sidebar-brand text-xs uppercase tracking-widest text-[#21d4b4]">CIR Admin</p>
          <h1 className="cir-sidebar-title mt-1 text-lg font-semibold">Citizen Issue Report</h1>
          <p className="mt-2 truncate text-sm text-slate-400">{user?.name}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-lg border border-cir-border-subtle px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-700/50 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="cir-main flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
