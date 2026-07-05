import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/context/ThemeContext'

const options: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Daylight', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' }
]

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={`cir-theme-toggle flex items-center gap-1 rounded-xl bg-cir-bg-deep p-1 ${compact ? '' : 'w-full'}`}
      role="group"
      aria-label="Theme preference"
    >
      {options.map((option) => {
        const active = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={active}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
              active
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span aria-hidden>{option.icon}</span>
            {!compact ? <span>{option.label}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
