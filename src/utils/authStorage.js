/**
 * Hybrid auth storage: access token in memory, refresh token in httpOnly cookie.
 * Access token is lost on page refresh - restore via /auth/refresh (cookie sent automatically).
 */
let accessTokenMemory = null;

export const authStorage = {
    getAccessToken: () => accessTokenMemory,

    setAccessToken: (token) => {
        accessTokenMemory = token || null;
    },

    /** For login/register - only access token stored (refresh token in httpOnly cookie) */
    setTokens: (accessToken) => {
        accessTokenMemory = accessToken || null;
    },

    clearTokens: () => {
        accessTokenMemory = null;
        // Clear any legacy localStorage tokens
        ['access-token', 'refresh-token', 'token', 'accessToken', 'refreshToken'].forEach((k) =>
            localStorage.removeItem(k)
        );
    },

    isAuthenticated: () => !!accessTokenMemory,
};
