export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';
const LEGACY_TOKEN_KEY = 'jwt_token';
const LEGACY_USER_KEY = 'auth_user';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || '';
}

export function setToken(token) {
    if (!token) {
        return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getUser() {
    const rawUser = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch {
        return null;
    }
}

export function setUser(user) {
    if (!user) {
        return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(LEGACY_USER_KEY);
}

export function removeUser() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
}

export function clearAuthState() {
    removeToken();
    removeUser();
}

export function isAuthenticated() {
    return Boolean(getToken());
}

export function migrateLegacyAuthStorage() {
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);

    if (legacyToken && !localStorage.getItem(TOKEN_KEY)) {
        setToken(legacyToken);
    }
}
