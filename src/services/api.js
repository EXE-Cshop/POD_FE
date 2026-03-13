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

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => (token ? prom.resolve(token) : prom.reject(error)));
    failedQueue = [];
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
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const res = await api.post('/auth/refresh', {});
                const { accessToken } = res.data?.data || res.data || {};
                if (accessToken) {
                    authStorage.setAccessToken(accessToken);
                    processQueue(null, accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                authStorage.clearTokens();
                if (typeof window !== 'undefined') window.location.href = '/home/login';
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    logout: () => api.post('/auth/logout'),
};

export const adminService = {
    getStats: () => api.get('/admin/dashboard/stats'),
    getOrderDetail: (orderId) => api.get(`/admin/dashboard/orders/${orderId}`),
};

export const orderService = {
    getOrders: (params) => api.get('/orders', { params }),
    checkout: (data) => api.post(`${API_ORIGIN}/api/checkout`, data),
};

export const baseProductService = {
    getAll: (params) => api.get('/base-products', { params }),
    getById: (id) => api.get(`/base-products/${id}`),
    create: (data) => api.post('/base-products', data),
    update: (id, data) => api.put(`/base-products/${id}`, data),
    delete: (id) => api.delete(`/base-products/${id}`),
};

export const productVariantService = {
    getByBaseProductId: (baseProductId) => api.get('/product-variants', { params: { baseProductId, page: 1, pageSize: 50, active: true } }),
};

export const rolesService = {
    getRoles: () => api.get('/roles'),
};

export const renderService = {
    /** POST /api/v1/renders/print - Render production print file from mm-based layers */
    renderPrintFile: (body) => api.post('/renders/print', body),
};

export const stickerService = {
    getAll: () => api.get('/stickers'),
    getById: (id) => api.get(`/stickers/${id}`),
    create: (data) => api.post('/stickers', data),
    /** Upload file lên Cloudinary và tạo sticker trong kho */
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/stickers/upload', formData, {
            headers: { 'Content-Type': undefined },
        });
    },
    update: (id, data) => api.put(`/stickers/${id}`, data),
    delete: (id) => api.delete(`/stickers/${id}`),
};

export const designProductService = {
    getPublic: () => api.get('/design-products/public'),
    getMyDesigns: () => api.get('/design-products/my'),
    getById: (id) => api.get(`/design-products/${id}`),
    create: (data) => api.post('/design-products', data),
    update: (id, data) => api.put(`/design-products/${id}`, data),
    setPublic: (id, value) => api.patch(`/design-products/${id}/public`, null, { params: { value } }),
    delete: (id) => api.delete(`/design-products/${id}`),
};

export const cartService = {
    get: () => api.get('/cart'),
    addItem: (productVariantId, quantity, { frontPrintUrl, backPrintUrl, customName } = {}) =>
        api.post('/cart/items', {
            productVariantId,
            quantity,
            frontPrintUrl: frontPrintUrl || undefined,
            backPrintUrl: backPrintUrl || undefined,
            customName: customName || undefined,
        }),
    updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, typeof data === 'number' ? { quantity: data } : data),
    removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
};

export const chatBotService = {
    chat: (data) => api.post('/chatbot', data),
};

export default api;
