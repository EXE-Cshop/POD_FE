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
    getMyOrders: (params) => api.get('/orders/my', { params }),
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

/**
 * Design Feed API — tương ứng với GET /api/v1/designs/feed (Spring Boot Pageable).
 * Backend trả về Page<Design> bọc trong ApiResponse.
 */
export const designFeedService = {
    /**
     * Lấy danh sách thiết kế công khai (isPublic=true) có phân trang.
     * @param {number} page  - Số trang (0-indexed, mặc định 0)
     * @param {number} size  - Số lượng mỗi trang (mặc định 10)
     * @param {string} sort  - Trường sắp xếp (mặc định "createdAt,desc")
     */
    getPublicFeed: (page = 0, size = 10, sort = 'createdDate,desc') =>
        api.get('/design-products/feed', { params: { page, size, sort } }),

    /** Lấy chi tiết design theo ID (bao gồm canvasData JSON). */
    getById: (id) => api.get(`/designs/${id}`),

    /** Tạo design mới. */
    create: (data) => api.post('/designs', data),
};

/**
 * Gift (QR Gift Card) API — tương ứng với GiftController.
 */
export const giftService = {
    /**
     * Tạo gift message mới.
     * @param {{ orderId: number, mediaUrl?: string, messageText?: string }} data
     */
    create: (data) => api.post('/gifts', data),

    /**
     * Lấy thông tin gift theo UUID (public, không cần auth).
     * @param {string} uuid
     */
    getByUuid: (uuid) => api.get(`/gifts/${uuid}`),

    /**
     * Lấy danh sách gift của tôi.
     */
    getMyGifts: () => api.get('/gifts/my'),
};

export default api;
