import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CitizenLayout from '../Layouts/CitizenLayout';
import { submitIssue } from '../lib/api';

const PRIORITY_LABELS = {
    1: 'Low',
    2: 'Below average',
    3: 'Medium',
    4: 'High',
    5: 'Critical',
};

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function ReportIssue({ districts }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [form, setForm] = useState({
        reporter_name: user?.name || '',
        title: '',
        description: '',
        district: '',
        sector: '',
        citizen_priority: 3,
        is_anonymous: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [submittedIssue, setSubmittedIssue] = useState(null);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setGeneralError('');
        setErrors({});

        try {
            const response = await submitIssue({
                ...form,
                sector: form.sector || null,
            });
            setSubmittedIssue(response.issue);
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setGeneralError(err.message || 'Could not submit your report. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    if (submittedIssue) {
        return (
            <CitizenLayout>
                <Head title="Report submitted" />

                <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-rw-green)] text-2xl text-white">
                            ✓
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Issue submitted successfully</h1>
                        <p className="mt-3 text-slate-600">
                            Your report has been received and will appear in the public feed after review.
                        </p>
                        <p className="mt-6 text-sm font-medium uppercase tracking-wide text-slate-500">
                            Reference number
                        </p>
                        <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-rw-blue)]">
                            {submittedIssue.reference_number}
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/dashboard"
                                className="rounded-xl bg-[var(--color-rw-blue)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                            >
                                Go to dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubmittedIssue(null);
                                    setForm({
                                        reporter_name: user?.name || '',
                                        title: '',
                                        description: '',
                                        district: '',
                                        sector: '',
                                        citizen_priority: 3,
                                        is_anonymous: false,
                                    });
                                }}
                                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                            >
                                Report another issue
                            </button>
                        </div>
                    </div>
                </div>
            </CitizenLayout>
        );
    }

    return (
        <CitizenLayout>
            <Head title="Report an issue" />

            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-rw-blue)]">
                        Citizen reporting
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">Report an issue</h1>
                    <p className="mt-3 text-slate-600">
                        Describe a local problem in your district. Your report helps government respond
                        faster and keeps the community informed.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                >
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Your name <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="text"
                            value={form.reporter_name}
                            onChange={(event) => updateField('reporter_name', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-[var(--color-rw-blue)] focus:ring-2 focus:ring-[var(--color-rw-blue)]/20"
                            placeholder="How should we address you?"
                            required
                        />
                        <FieldError message={errors.reporter_name?.[0]} />
                    </label>

                    <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <input
                            type="checkbox"
                            checked={form.is_anonymous}
                            onChange={(event) => updateField('is_anonymous', event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--color-rw-blue)] focus:ring-[var(--color-rw-blue)]"
                        />
                        <span>
                            <span className="block text-sm font-medium text-slate-900">
                                Hide my name on the public feed
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                                Your report stays public, but your name will not be shown to others.
                            </span>
                        </span>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Issue title <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(event) => updateField('title', event.target.value)}
                            maxLength={200}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-[var(--color-rw-blue)] focus:ring-2 focus:ring-[var(--color-rw-blue)]/20"
                            placeholder="Brief summary of the problem"
                            required
                        />
                        <FieldError message={errors.title?.[0]} />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Description <span className="text-red-500">*</span>
                        </span>
                        <textarea
                            value={form.description}
                            onChange={(event) => updateField('description', event.target.value)}
                            rows={6}
                            maxLength={5000}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-[var(--color-rw-blue)] focus:ring-2 focus:ring-[var(--color-rw-blue)]/20"
                            placeholder="Describe the issue, location details, and how it affects the community."
                            required
                        />
                        <FieldError message={errors.description?.[0]} />
                    </label>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                District <span className="text-red-500">*</span>
                            </span>
                            <select
                                value={form.district}
                                onChange={(event) => updateField('district', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-[var(--color-rw-blue)] focus:ring-2 focus:ring-[var(--color-rw-blue)]/20"
                                required
                            >
                                <option value="">Select a district</option>
                                {districts.map((district) => (
                                    <option key={district.id} value={district.name}>
                                        {district.name} ({district.province})
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.district?.[0]} />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">Sector</span>
                            <input
                                type="text"
                                value={form.sector}
                                onChange={(event) => updateField('sector', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-[var(--color-rw-blue)] focus:ring-2 focus:ring-[var(--color-rw-blue)]/20"
                                placeholder="Optional sector or area"
                            />
                            <FieldError message={errors.sector?.[0]} />
                        </label>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                                Priority <span className="text-red-500">*</span>
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                                {PRIORITY_LABELS[form.citizen_priority]} ({form.citizen_priority}/5)
                            </span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            step={1}
                            value={form.citizen_priority}
                            onChange={(event) =>
                                updateField('citizen_priority', Number(event.target.value))
                            }
                            className="w-full accent-[var(--color-rw-blue)]"
                        />
                        <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>Low</span>
                            <span>Critical</span>
                        </div>
                        <FieldError message={errors.citizen_priority?.[0]} />
                    </div>

                    {generalError && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-[var(--color-rw-green)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                        >
                            {loading ? 'Submitting…' : 'Submit report'}
                        </button>
                        <Link
                            href="/dashboard"
                            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </CitizenLayout>
    );
}
