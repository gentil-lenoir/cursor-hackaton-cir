import { Link, router, usePage } from '@inertiajs/react';
import { logout } from '../lib/api';

export default function CitizenLayout({ children }) {
    const { auth, app } = usePage().props;
    const user = auth?.user;

    async function handleLogout() {
        try {
            await logout();
        } catch {
            // Session may already be cleared.
        }

        router.visit('/', { replace: true });
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-rw-blue)] via-[var(--color-rw-yellow)] to-[var(--color-rw-green)] text-sm font-bold text-white shadow-sm">
                            CIR
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{app?.name || 'CIR'}</p>
                            <p className="text-xs text-slate-500">Citizen Issue Report</p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-3">
                        <button
                            type="button"
                            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline-flex"
                            aria-label="Language selector"
                        >
                            EN
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="hidden text-sm font-medium text-slate-700 hover:text-[var(--color-rw-blue)] sm:inline"
                                >
                                    Dashboard
                                </Link>
                                <span className="hidden text-sm text-slate-500 sm:inline">
                                    {user.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-xl bg-[var(--color-rw-blue)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main>{children}</main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>© {new Date().getFullYear()} Citizen Issue Report — Rwanda</p>
                    <p>Report local issues. Track progress. Build better communities.</p>
                </div>
            </footer>
        </div>
    );
}
