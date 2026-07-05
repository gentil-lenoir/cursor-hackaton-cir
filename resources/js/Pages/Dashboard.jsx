import { Head, Link, usePage } from '@inertiajs/react';
import CitizenLayout from '../Layouts/CitizenLayout';

export default function Dashboard({ issueCount = 0 }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <CitizenLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-rw-blue)]">
                        Citizen dashboard
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Welcome{user?.name ? `, ${user.name}` : ''}
                    </h1>
                    <p className="mt-3 max-w-2xl text-slate-600">
                        Report local issues, track their status, and follow community progress on public
                        concerns across Rwanda.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Account
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">{user?.role}</p>
                            <p className="mt-1 text-sm text-slate-500">Status: {user?.status}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Language
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                {(user?.language || 'en').toUpperCase()}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">Multilingual UI coming soon</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                My issues
                            </p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{issueCount}</p>
                            <p className="mt-1 text-sm text-slate-500">
                                {issueCount === 1 ? 'Report submitted' : 'Reports submitted'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/report"
                            className="rounded-xl bg-[var(--color-rw-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            Report an issue
                        </Link>
                        <Link
                            href="/"
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </CitizenLayout>
    );
}
