import { getToken, migrateLegacyAuthStorage } from './auth-storage';
import { syncAuthenticatedUser } from './auth.js';

const DEFAULT_FALLBACK_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23e2e8f0'/%3E%3Ccircle cx='250' cy='180' r='60' fill='%2394a3b8'/%3E%3Cpath d='M120 390l150-130 85 75 115-125 210 180H120z' fill='%2364758b'/%3E%3Ctext x='50%25' y='90%25' text-anchor='middle' font-family='Public Sans, sans-serif' font-size='30' fill='%230f172a'%3EIssue image unavailable%3C/text%3E%3C/svg%3E";

const escapeHtml = (value = '') =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

const formatStatus = (status) =>
    String(status || 'unknown')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';

const statusClass = (status) => {
    switch (status) {
        case 'resolved':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'in_progress':
            return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'escalated':
            return 'bg-rose-100 text-rose-700 border-rose-200';
        default:
            return 'bg-blue-100 text-blue-700 border-blue-200';
    }
};

async function apiRequest(url, options = {}) {
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const payload = isJson ? await response.json() : {};

    if (!response.ok) {
        const error = new Error(payload.message || 'Request failed.');
        error.payload = payload;
        error.status = response.status;
        throw error;
    }

    return payload;
}

function applyImageFallbacks(scope = document) {
    scope.querySelectorAll('.js-fallback-image').forEach((image) => {
        image.addEventListener(
            'error',
            () => {
                image.src = DEFAULT_FALLBACK_IMAGE;
            },
            { once: true },
        );
    });
}

function renderFeedCard(issue) {
    const imageUrl = issue?.images?.[0]?.url || DEFAULT_FALLBACK_IMAGE;
    const detailUrl = `/community/${issue.id}`;
    const upvotes = Number(issue?.upvotes_count || 0);
    const comments = Number(issue?.comments_count || 0);
    const reporter = issue?.reporter?.name || 'Anonymous citizen';
    const hasUpvoted = Boolean(issue?.has_upvoted);

    return `
        <article class="cir-landing-card overflow-hidden">
            <a href="${detailUrl}" class="block">
                <img class="h-48 w-full object-cover js-fallback-image" src="${imageUrl}" alt="${escapeHtml(issue.title)}" loading="lazy">
            </a>
            <div class="p-6">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span class="cir-pill ${statusClass(issue.status)}">${escapeHtml(formatStatus(issue.status))}</span>
                    <span class="text-xs font-semibold uppercase tracking-[0.16em]" style="color: var(--cir-text-faint)">#CF-${issue.id}</span>
                </div>
                <a href="${detailUrl}" class="block">
                    <h2 class="mb-2 text-xl font-bold transition hover:text-emerald-500" style="color: var(--cir-text)">${escapeHtml(issue.title)}</h2>
                </a>
                <p class="mb-4 line-clamp-3 text-sm" style="color: var(--cir-text-muted)">${escapeHtml(issue.description || 'No description provided.')}</p>
                <div class="mb-4 flex flex-wrap gap-3 text-xs font-semibold" style="color: var(--cir-text-faint)">
                    <span class="inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">person</span>
                        ${escapeHtml(reporter)}
                    </span>
                    <span class="inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">location_on</span>
                        ${escapeHtml(issue.location?.address || 'Location pending')}
                    </span>
                    <span>${escapeHtml(issue.category || 'General')}</span>
                </div>
                <div class="flex items-center justify-between gap-4 border-t pt-4" style="border-color: var(--cir-border)">
                    <div class="flex items-center gap-4 text-sm font-semibold" style="color: var(--cir-text-muted)">
                        <span class="inline-flex items-center gap-1 ${hasUpvoted ? 'text-emerald-500' : ''}">
                            <span class="material-symbols-outlined text-base">thumb_up</span>
                            ${upvotes}
                        </span>
                        <span class="inline-flex items-center gap-1">
                            <span class="material-symbols-outlined text-base">chat_bubble</span>
                            ${comments}
                        </span>
                    </div>
                    <a href="${detailUrl}" class="cir-btn cir-btn-ghost !px-4 !py-2 text-sm">View &amp; discuss</a>
                </div>
            </div>
        </article>
    `;
}

function renderIssueDetail(issue) {
    const imageUrl = issue?.images?.[0]?.url || DEFAULT_FALLBACK_IMAGE;
    const upvotes = Number(issue?.upvotes_count || 0);
    const hasUpvoted = Boolean(issue?.has_upvoted);
    const reporter = issue?.reporter?.name || 'Anonymous citizen';
    const worker = issue?.worker?.name || issue?.assignment?.worker?.name;

    const imagesMarkup =
        issue?.images?.length > 1
            ? `<div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                ${issue.images
                    .map(
                        (image) =>
                            `<img class="h-28 w-full rounded-2xl object-cover js-fallback-image" src="${image.url}" alt="Issue photo" loading="lazy">`,
                    )
                    .join('')}
            </div>`
            : '';

    return `
        <article class="cir-card overflow-hidden">
            <img class="h-64 w-full object-cover js-fallback-image sm:h-80" src="${imageUrl}" alt="${escapeHtml(issue.title)}" loading="lazy">
            <div class="p-6 sm:p-8">
                <div class="mb-4 flex flex-wrap items-center gap-3">
                    <span class="cir-pill ${statusClass(issue.status)}">${escapeHtml(formatStatus(issue.status))}</span>
                    <span class="cir-pill">${escapeHtml(issue.category || 'General')}</span>
                    <span class="cir-pill">${escapeHtml(issue.priority || 'medium')} priority</span>
                </div>
                <h1 class="cir-title mb-3 !text-2xl sm:!text-3xl">${escapeHtml(issue.title)}</h1>
                <p class="mb-6 text-base leading-relaxed" style="color: var(--cir-text-muted)">${escapeHtml(issue.description || 'No description provided.')}</p>

                <div class="mb-6 grid gap-4 sm:grid-cols-2">
                    <div class="rounded-2xl p-4" style="background: var(--cir-surface-muted)">
                        <p class="cir-label !mb-2">Reported by</p>
                        <p class="font-semibold" style="color: var(--cir-text)">${escapeHtml(reporter)}</p>
                        <p class="mt-1 text-sm" style="color: var(--cir-text-muted)">${escapeHtml(formatDateTime(issue.reported_at || issue.created_at))}</p>
                    </div>
                    <div class="rounded-2xl p-4" style="background: var(--cir-surface-muted)">
                        <p class="cir-label !mb-2">Location</p>
                        <p class="font-semibold" style="color: var(--cir-text)">${escapeHtml(issue.location?.address || 'Location pending')}</p>
                        <p class="mt-1 text-sm" style="color: var(--cir-text-muted)">${worker ? `Assigned to ${escapeHtml(worker)}` : 'Awaiting assignment'}</p>
                    </div>
                </div>

                ${imagesMarkup}

                <div class="mt-8 flex flex-wrap items-center gap-4 border-t pt-6" style="border-color: var(--cir-border)">
                    <button
                        class="cir-btn ${hasUpvoted ? 'cir-btn-primary' : 'cir-btn-secondary'}"
                        data-upvote-button
                        data-has-upvoted="${hasUpvoted ? '1' : '0'}"
                        type="button"
                    >
                        <span class="material-symbols-outlined">thumb_up</span>
                        <span data-upvote-count>${upvotes}</span>
                        <span data-upvote-label>${hasUpvoted ? 'Supported' : 'Support this issue'}</span>
                    </button>
                    <p class="text-sm" style="color: var(--cir-text-muted)">
                        <span data-comments-count-inline>${Number(issue.comments_count || 0)}</span> community comments
                    </p>
                    <p class="hidden text-sm" data-upvote-message role="status"></p>
                </div>
            </div>
        </article>
    `;
}

function renderComment(comment) {
    return `
        <article class="cir-card p-5">
            <div class="flex items-start gap-4">
                <div class="cir-icon-chip shrink-0 !h-11 !w-11">
                    <span class="material-symbols-outlined">person</span>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="mb-2 flex flex-wrap items-center gap-3">
                        <p class="font-bold" style="color: var(--cir-text)">${escapeHtml(comment.user?.name || 'Citizen')}</p>
                        <span class="text-xs font-semibold" style="color: var(--cir-text-faint)">${escapeHtml(formatDateTime(comment.created_at))}</span>
                    </div>
                    <p class="text-sm leading-relaxed" style="color: var(--cir-text-muted)">${escapeHtml(comment.comment)}</p>
                </div>
            </div>
        </article>
    `;
}

async function initCommunityFeed() {
    const feedNode = document.querySelector('[data-community-feed]');
    if (!feedNode) {
        return;
    }

    const searchInput = document.querySelector('[data-community-search]');
    const statusFilter = document.querySelector('[data-community-status]');
    const categoryFilter = document.querySelector('[data-community-category]');
    const countNode = document.querySelector('[data-community-count]');
    const feedbackNode = document.querySelector('[data-community-feedback]');
    const loadMoreButton = document.querySelector('[data-community-load-more]');

    let page = 1;
    let lastPage = 1;
    let issues = [];

    const buildUrl = (nextPage = 1) => {
        const params = new URLSearchParams({
            limit: '12',
            page: String(nextPage),
        });

        if (statusFilter?.value) {
            params.set('status', statusFilter.value);
        }

        if (categoryFilter?.value) {
            params.set('category', categoryFilter.value);
        }

        if (searchInput?.value.trim()) {
            params.set('search', searchInput.value.trim());
        }

        return `/api/issues?${params.toString()}`;
    };

    const render = () => {
        if (!issues.length) {
            feedNode.innerHTML = `
                <div class="cir-card p-8 text-center md:col-span-2 xl:col-span-3">
                    <p class="text-lg font-bold" style="color: var(--cir-text)">No issues match your filters</p>
                    <p class="mt-2 text-sm" style="color: var(--cir-text-muted)">Try clearing filters or be the first to report a new issue.</p>
                </div>
            `;
            return;
        }

        feedNode.innerHTML = issues.map(renderFeedCard).join('');
        applyImageFallbacks(feedNode);
    };

    const loadIssues = async ({ append = false } = {}) => {
        if (feedbackNode) {
            feedbackNode.textContent = '';
            feedbackNode.classList.add('hidden');
        }

        try {
            const payload = await apiRequest(buildUrl(page));
            const batch = Array.isArray(payload?.data) ? payload.data : [];
            issues = append ? [...issues, ...batch] : batch;

            const total = Number(payload?.meta?.total ?? issues.length);
            lastPage = Number(payload?.meta?.last_page ?? 1);

            if (countNode) {
                countNode.textContent = String(total);
            }

            render();

            if (loadMoreButton) {
                loadMoreButton.classList.toggle('hidden', page >= lastPage);
            }
        } catch (error) {
            feedNode.innerHTML = `
                <div class="cir-card p-8 text-center md:col-span-2 xl:col-span-3">
                    <p class="text-lg font-bold" style="color: var(--cir-text)">Unable to load community issues</p>
                    <p class="mt-2 text-sm" style="color: var(--cir-text-muted)">${escapeHtml(error.message)}</p>
                </div>
            `;

            if (feedbackNode) {
                feedbackNode.textContent = 'Please refresh the page and try again.';
                feedbackNode.classList.remove('hidden');
            }
        }
    };

    const resetAndLoad = async () => {
        page = 1;
        await loadIssues({ append: false });
    };

    searchInput?.addEventListener('input', () => {
        clearTimeout(searchInput._communityTimer);
        searchInput._communityTimer = setTimeout(resetAndLoad, 300);
    });
    statusFilter?.addEventListener('change', resetAndLoad);
    categoryFilter?.addEventListener('change', resetAndLoad);
    loadMoreButton?.addEventListener('click', async () => {
        page += 1;
        await loadIssues({ append: true });
    });

    await resetAndLoad();
}

async function initCommunityDetail() {
    const section = document.querySelector('[data-community-page="detail"]');
    if (!section) {
        return;
    }

    const issueId = section.dataset.issueId;
    const detailNode = section.querySelector('[data-issue-detail]');
    const commentsListNode = section.querySelector('[data-comments-list]');
    const commentsCountNode = section.querySelector('[data-comments-count]');
    const commentFormWrap = section.querySelector('[data-comment-form-wrap]');
    const commentForm = section.querySelector('[data-comment-form]');
    const commentInput = section.querySelector('[data-comment-input]');
    const commentMessage = section.querySelector('[data-comment-message]');
    const commentAuthHint = section.querySelector('[data-comment-auth-hint]');
    const loginUrl = section.dataset.loginUrl || '/login';

    migrateLegacyAuthStorage();
    const token = getToken();
    let currentUser = null;

    if (token) {
        try {
            currentUser = await syncAuthenticatedUser({
                apiMeUrl: document.body.dataset.apiMeUrl || '/api/me',
            });
        } catch {
            currentUser = null;
        }
    }

    const isCitizen = currentUser?.role === 'citizen';

    if (isCitizen) {
        commentAuthHint?.classList.add('hidden');
        commentForm?.classList.remove('hidden');
    } else if (token) {
        commentAuthHint.textContent = 'Only citizen accounts can comment on community issues.';
    } else {
        commentAuthHint.innerHTML = `Sign in to join the discussion. <a href="${loginUrl}" class="font-bold text-emerald-500 hover:underline">Login</a>`;
    }

    let issue = null;

    const loadComments = async () => {
        try {
            const payload = await apiRequest(section.dataset.commentsUrl);
            const comments = Array.isArray(payload?.data) ? payload.data : [];

            if (commentsCountNode) {
                commentsCountNode.textContent = String(payload?.meta?.total ?? comments.length);
            }

            const inlineCount = section.querySelector('[data-comments-count-inline]');
            if (inlineCount) {
                inlineCount.textContent = String(payload?.meta?.total ?? comments.length);
            }

            commentsListNode.innerHTML = comments.length
                ? comments.map(renderComment).join('')
                : '<div class="cir-card p-6 text-sm" style="color: var(--cir-text-muted)">No comments yet. Be the first to share an update.</div>';
        } catch (error) {
            commentsListNode.innerHTML = `<div class="cir-card p-6 text-sm" style="color: var(--cir-text-muted)">Unable to load comments. ${escapeHtml(error.message)}</div>`;
        }
    };

    const loadIssue = async () => {
        try {
            const payload = await apiRequest(section.dataset.issueUrl);
            issue = payload.data || payload;
            detailNode.innerHTML = renderIssueDetail(issue);
            applyImageFallbacks(detailNode);
            bindUpvoteButton();
        } catch (error) {
            detailNode.innerHTML = `
                <div class="cir-card p-8 text-center">
                    <p class="text-lg font-bold" style="color: var(--cir-text)">Issue not found</p>
                    <p class="mt-2 text-sm" style="color: var(--cir-text-muted)">${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    };

    const bindUpvoteButton = () => {
        const upvoteButton = section.querySelector('[data-upvote-button]');
        const upvoteCountNode = section.querySelector('[data-upvote-count]');
        const upvoteMessage = section.querySelector('[data-upvote-message]');

        upvoteButton?.addEventListener('click', async () => {
            if (!isCitizen) {
                window.location.href = loginUrl;
                return;
            }

            if (upvoteButton.dataset.hasUpvoted === '1') {
                if (upvoteMessage) {
                    upvoteMessage.textContent = 'You already supported this issue.';
                    upvoteMessage.classList.remove('hidden');
                }
                return;
            }

            try {
                const payload = await apiRequest(section.dataset.upvoteUrl, { method: 'POST' });
                const count = Number(payload?.data?.upvotes_count ?? issue?.upvotes_count ?? 0);

                if (upvoteCountNode) {
                    upvoteCountNode.textContent = String(count);
                }

                upvoteButton.dataset.hasUpvoted = '1';
                upvoteButton.className = 'cir-btn cir-btn-primary';
                section.querySelector('[data-upvote-label]')?.replaceChildren(document.createTextNode('Supported'));

                if (upvoteMessage) {
                    upvoteMessage.textContent = payload.message || 'Thanks for supporting this issue.';
                    upvoteMessage.classList.remove('hidden');
                }
            } catch (error) {
                if (upvoteMessage) {
                    upvoteMessage.textContent = error.message;
                    upvoteMessage.classList.remove('hidden');
                }
            }
        });
    };

    commentForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!isCitizen) {
            window.location.href = loginUrl;
            return;
        }

        const comment = commentInput?.value.trim();
        if (!comment) {
            return;
        }

        if (commentMessage) {
            commentMessage.textContent = '';
            commentMessage.className = 'hidden text-sm';
        }

        try {
            await apiRequest(section.dataset.commentsPostUrl, {
                method: 'POST',
                body: JSON.stringify({
                    issue_id: Number(issueId),
                    comment,
                }),
            });

            commentInput.value = '';
            await loadComments();

            if (commentMessage) {
                commentMessage.textContent = 'Comment posted successfully.';
                commentMessage.className = 'text-sm text-emerald-500';
            }
        } catch (error) {
            if (commentMessage) {
                commentMessage.textContent = error.message;
                commentMessage.className = 'text-sm text-rose-500';
            }
        }
    });

    await Promise.all([loadIssue(), loadComments()]);
}

document.addEventListener('DOMContentLoaded', async () => {
    await initCommunityFeed();
    await initCommunityDetail();
});
