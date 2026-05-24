import axios from 'axios';
import { authStorage } from '../utils/authStorage';

const API_BASE_URL = 'http://localhost:8080/api/v1';
/** Backend origin for normalizing relative image URLs (e.g. sticker/upload links) */
export const API_ORIGIN = (() => {
    try { return new URL(API_BASE_URL).origin; } catch { return window?.location?.origin || 'http://localhost:8080'; }
})();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

/** Upload image file - returns url string for preview */
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': undefined },
    });
    const data = res.data;
    return typeof data === 'object' && data?.url ? data.url : data;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, data = null) => {
    failedQueue.forEach((prom) => (data ? prom.resolve(data) : prom.reject(error)));
    failedQueue = [];
};

/**
 * Shared refresh logic to ensure only one /auth/refresh is in flight.
 * Returns the fresh user data on success.
 */
export const refreshSession = async () => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;
    try {
        const res = await api.post('/auth/refresh', {});
        const data = res.data?.data || res.data;
        
        if (data && data.user) {
            processQueue(null, data);
            return data;
        }
        throw new Error('Invalid refresh response');
    } catch (err) {
        processQueue(err);
        authStorage.clearTokens();
        throw err;
    } finally {
        isRefreshing = false;
    }
};

api.interceptors.request.use(
    (config) => {
        const token = authStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
        
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
                await refreshSession();
                return api(originalRequest);
            } catch (refreshErr) {
                // If refresh fails, just reject.
                // Redirection should be handled by components (e.g. ProtectedRoute)
                // or specific page logic.
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(error);
    }
);

export const getCurrentUser = async () => {
    const res = await api.get('/users/me');
    return res.data?.data || res.data;
};

export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
};

export const adminService = {
    getStats: () => api.get('/admin/dashboard/stats'),
    getOrderDetail: (orderId) => api.get(`/admin/dashboard/orders/${orderId}`),
};

export const orderService = {
    getOrders: (params) => api.get('/orders', { params }),
    getMyOrders: (params) => api.get('/orders/me', { params }),
    getMyOrderDetail: (id) => api.get(`/orders/me/${id}`),
    checkout: (data) => api.post('/checkout', data),
};

export const productService = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getDetail: (id) => api.get(`/products/${id}/detail`),
    getBySlug: (slug) => api.get(`/products/slug/${slug}`),
    getTrending: () => api.get('/products/trending'),
    getFeatured: () => api.get('/products/featured'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const categoryService = {
    getAll: () => api.get('/categories'),
    getBySlug: (slug) => api.get(`/categories/${slug}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const reviewService = {
    getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
    create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

export const wishlistService = {
    get: () => api.get('/wishlist'),
    add: (productId) => api.post(`/wishlist/${productId}`),
    remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const promotionService = {
    getAll: () => api.get('/promotions'),
    getActive: () => api.get('/promotions/active'),
    create: (data) => api.post('/promotions', data),
    update: (id, data) => api.put(`/promotions/${id}`, data),
    delete: (id) => api.delete(`/promotions/${id}`),
    validate: (code) => api.post('/promotions/validate', { code }),
};

export const rolesService = {
    getRoles: () => api.get('/roles'),
    getRole: (id) => api.get(`/roles/${id}`),
    createRole: (data) => api.post('/roles', data),
    updateRole: (id, data) => api.put(`/roles/${id}`, data),
    deleteRole: (id) => api.delete(`/roles/${id}`),
};

export const permissionsService = {
    getPermissions: () => api.get('/permissions'),
};

export const usersService = {
    getUsers: () => api.get('/users'),
    getMe: () => api.get('/users/me'),
    createUser: (data) => api.post('/users', data),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deactivateUser: (id) => api.delete(`/users/${id}`),
};

export const cartService = {
    get: () => api.get('/cart'),
    addItem: (productVariantId, quantity) =>
        api.post('/cart/items', {
            productVariantId,
            quantity,
        }),
    updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, typeof data === 'number' ? { quantity: data } : data),
    removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
};

export const chatBotService = {
    chat: (data) => api.post('/chatbot', data),
};

export default api;
