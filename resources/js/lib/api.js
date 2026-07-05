let csrfReady = false;

async function ensureCsrfCookie() {
    if (csrfReady) {
        return;
    }

    await fetch('/sanctum/csrf-cookie', {
        credentials: 'same-origin',
    });

    csrfReady = true;
}

function csrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export async function apiRequest(url, options = {}) {
    await ensureCsrfCookie();

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
    };

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase() ?? 'GET')) {
        headers['X-XSRF-TOKEN'] = csrfToken();
    }

    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.status = response.status;
        error.errors = data.errors;
        throw error;
    }

    return data;
}

export async function requestOtp(phone) {
    return apiRequest('/api/v1/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
}

export async function verifyOtp(phone, code) {
    return apiRequest('/api/v1/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code, client: 'citizen-web' }),
    });
}

export async function logout() {
    return apiRequest('/api/v1/auth/logout', {
        method: 'POST',
    });
}
