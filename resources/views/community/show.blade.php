@extends('layouts.app')

@push('page_assets')
    @vite(['resources/js/community.js'])
@endpush

@section('title', 'Issue Details — CIR Community')

@section('content')
    <section
        class="cir-landing-section px-6 py-12 md:px-12 md:py-16 lg:px-24"
        data-community-page="detail"
        data-issue-id="{{ $issueId }}"
        data-issue-url="{{ url('/api/issues/'.$issueId) }}"
        data-comments-url="{{ url('/api/issues/'.$issueId.'/comments') }}"
        data-upvote-url="{{ url('/api/issues/'.$issueId.'/upvote') }}"
        data-comments-post-url="{{ url('/api/comments') }}"
        data-login-url="{{ route('login') }}"
    >
        <div class="mx-auto max-w-4xl">
            <a href="{{ route('community.index') }}" class="cir-back-link mb-8 inline-flex items-center gap-2 text-sm font-semibold">
                <span class="material-symbols-outlined text-lg">arrow_back</span>
                Back to community feed
            </a>

            <div data-issue-detail>
                <div class="cir-card p-8 text-sm" style="color: var(--cir-text-muted)">Loading issue details...</div>
            </div>

            <div class="mt-10">
                <div class="mb-6 flex items-center justify-between gap-4">
                    <h2 class="cir-section-heading">Community Discussion</h2>
                    <span class="cir-pill"><span data-comments-count>0</span> comments</span>
                </div>

                <div class="cir-card mb-6 p-6" data-comment-form-wrap>
                    <p class="mb-4 text-sm" style="color: var(--cir-text-muted)" data-comment-auth-hint>
                        Sign in to join the discussion and share updates with other citizens.
                    </p>
                    <form class="hidden space-y-4" data-comment-form>
                        <textarea
                            class="cir-input min-h-28 resize-y"
                            data-comment-input
                            maxlength="1000"
                            placeholder="Share an update, ask a question, or support this report..."
                            required
                        ></textarea>
                        <div class="flex items-center justify-between gap-4">
                            <p class="hidden text-sm" data-comment-message role="status"></p>
                            <button class="cir-btn cir-btn-primary ml-auto" type="submit">
                                <span class="material-symbols-outlined">send</span>
                                Post Comment
                            </button>
                        </div>
                    </form>
                </div>

                <div class="space-y-4" data-comments-list>
                    <div class="cir-card p-6 text-sm" style="color: var(--cir-text-muted)">Loading comments...</div>
                </div>
            </div>
        </div>
    </section>
@endsection
