import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    update: (id, data) => api.put(`/stickers/${id}`, data),
    delete: (id) => api.delete(`/stickers/${id}`),
};

export const chatBotService = {
    chat: (data) => api.post('/chatbot', data),
};

export default api;
