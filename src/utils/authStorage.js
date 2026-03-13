/**
 * Hybrid auth storage: access token in memory, refresh token in httpOnly cookie.
 * Access token is lost on page refresh - restore via /auth/refresh (cookie sent automatically).
 */
let accessTokenMemory = null;

export const authStorage = {
    getAccessToken: () => null, // No longer stored in JS

    getRefreshToken: () => null, // No longer stored in JS

    setAccessToken: () => {},

    setRefreshToken: () => {},

    setTokens: () => {},

    clearTokens: () => {
        // We rely on backend logout to clear cookies
        // But we can clear any accidental localStorage entries
        ['refresh-token', 'access-token', 'token', 'accessToken', 'refreshToken', 'pod_access_token'].forEach((k) =>
            localStorage.removeItem(k)
        );
        sessionStorage.removeItem('pod_access_token');
    },

    isAuthenticated: () => true, // We'll rely on the user object in AuthProvider
};
