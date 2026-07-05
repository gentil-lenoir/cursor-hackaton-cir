import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LoginModal from '../Components/LoginModal';
import CitizenLayout from '../Layouts/CitizenLayout';

export default function Home() {
    const { auth } = usePage().props;
    const [loginOpen, setLoginOpen] = useState(false);
    const isLoggedIn = Boolean(auth?.user);

    return (
        <CitizenLayout>
            <section className="relative overflow-hidden bg-[var(--color-rw-dark)] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,161,222,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(32,96,61,0.35),transparent_40%)]" />
                <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
                    <div>
                        <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
                            Rwanda Civic Platform
                        </p>
                        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                            Report community issues. Track real progress.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg text-white/80">
                            Citizen Issue Report connects Rwandan residents with local government to
                            report roads, water, sanitation, health, and other public concerns —
                            transparently and accountably.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-xl bg-[var(--color-rw-yellow)] px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:brightness-110"
                                >
                                    Go to dashboard
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setLoginOpen(true)}
                                    className="rounded-xl bg-[var(--color-rw-yellow)] px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:brightness-110"
                                >
                                    Report an issue
                                </button>
                            )}
                            <a
                                href="#public-feed"
                                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Browse public feed
                            </a>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold">How CIR works</h2>
                        <ol className="mt-4 space-y-4 text-sm text-white/85">
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-rw-blue)] text-sm font-bold">
                                    1
                                </span>
                                <span>Sign in with your +250 mobile number and a secure one-time code.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-rw-green)] text-sm font-bold">
                                    2
                                </span>
                                <span>Submit an issue with photos, district, and priority.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-rw-yellow)] text-sm font-bold text-slate-900">
                                    3
                                </span>
                                <span>Track status as government workers resolve it — publicly.</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </section>

            <section id="public-feed" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Public issue feed</h2>
                        <p className="mt-2 text-slate-600">
                            Community reports from across Rwanda will appear here once reporting is
                            enabled.
                        </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Coming soon
                    </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {['Road damage in Gasabo', 'Water outage in Huye', 'Street lighting in Kicukiro'].map(
                        (title) => (
                            <article
                                key={title}
                                className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-rw-blue)]">
                                    Preview
                                </p>
                                <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Issue reporting and the live public feed will be available in the
                                    next development phase.
                                </p>
                            </article>
                        ),
                    )}
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                title: 'Transparent',
                                body: 'Issues are public by default so communities can follow progress together.',
                            },
                            {
                                title: 'Accountable',
                                body: 'Every status change and assignment is logged for government oversight.',
                            },
                            {
                                title: 'Community-driven',
                                body: 'Citizens vote to raise or lower urgency on issues that matter locally.',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                            >
                                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {!isLoggedIn && (
                <section className="border-t border-slate-200 bg-gradient-to-r from-[var(--color-rw-blue)]/10 to-[var(--color-rw-green)]/10">
                    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-12 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Ready to make a difference?</h2>
                            <p className="mt-2 text-slate-600">
                                Create your citizen account in seconds with your Rwanda mobile number.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setLoginOpen(true)}
                            className="rounded-xl bg-[var(--color-rw-blue)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                        >
                            Sign in with phone
                        </button>
                    </div>
                </section>
            )}

            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        </CitizenLayout>
    );
}
