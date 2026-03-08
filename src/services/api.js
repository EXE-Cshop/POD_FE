import axios from 'axios';

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

// Add a request interceptor to add the token to the header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const adminService = {
    getStats: () => api.get('/admin/dashboard/stats'),
    getOrderDetail: (orderId) => api.get(`/admin/dashboard/orders/${orderId}`),
};

export const orderService = {
    getOrders: (params) => api.get('/orders', { params }),
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

export const chatBotService = {
    chat: (data) => api.post('/chatbot', data),
};


export default api;
