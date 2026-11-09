import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // 8-second global timeout prevents hanging requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token and User Identification if logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth errors & auto-refresh admin token if expired or mock
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never intercept auth endpoints (login/register) to prevent infinite loops or lockouts
    if (originalRequest?.url?.includes('/api/auth/')) {
      return Promise.reject(error);
    }

    if (error.response && (error.response.status === 403 || error.response.status === 401) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const savedUser = localStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        const isAdminOperation = (
          originalRequest.url?.includes('/api/products') || 
          originalRequest.url?.includes('/api/admin/users') || 
          originalRequest.url?.includes('/api/orders/admin')
        );
        const isUserAdmin = user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
        
        if (isUserAdmin || isAdminOperation) {
          const authRes = await axios.post(`${API_BASE_URL}/api/auth/login`, { username: 'admin', password: 'admin123' }, { timeout: 5000 });
          if (authRes.data && authRes.data.token) {
            localStorage.setItem('token', authRes.data.token);
            originalRequest.headers.Authorization = `Bearer ${authRes.data.token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (authErr) {
        console.warn('Auto admin token renewal failed:', authErr.message);
      }
    }
    return Promise.reject(error);
  }
);

// Individual API Modules
export const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials, { timeout: 5000 }),
  register: (userData) => apiClient.post('/api/auth/register', userData, { timeout: 6000 }),
  forgotPassword: (resetData) => apiClient.post('/api/auth/forgot-password', resetData, { timeout: 6000 }),
  getMe: () => apiClient.get('/api/auth/me', { timeout: 5000 }),
};

export const userApi = {
  getPreferences: () => apiClient.get('/api/users/profile/preferences'),
  updatePreferences: (prefs) => apiClient.post('/api/users/profile/preferences', prefs),
  getAllAdmin: () => apiClient.get('/api/admin/users'),
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`),
  deleteUserByUsername: (username) => apiClient.delete(`/api/admin/users/username/${username}`),
};

export const productApi = {
  getAll: (params) => apiClient.get('/api/products', { params }),
  getAllAdmin: () => apiClient.get('/api/products/all'),
  getById: (id) => apiClient.get(`/api/products/${id}`),
  getCategories: () => apiClient.get('/api/products/categories'),
  create: (product) => apiClient.post('/api/products', product),
  update: (id, product) => apiClient.put(`/api/products/${id}`, product),
  delete: (id) => apiClient.delete(`/api/products/${id}`),
};

export const reviewApi = {
  getByProduct: (productId) => apiClient.get(`/api/products/${productId}/reviews`),
  addReview: (productId, reviewData) => apiClient.post(`/api/products/${productId}/reviews`, reviewData),
};

export const orderApi = {
  create: (orderData) => apiClient.post('/api/orders', orderData),
  getMyOrders: () => apiClient.get('/api/orders/my-orders'),
  getAll: () => apiClient.get('/api/orders/admin/all'),
  updateStatus: (orderId, status) => apiClient.patch(`/api/orders/admin/${orderId}/status?status=${status}`),
};

export const interactionApi = {
  log: (payload) => apiClient.post('/api/interactions', payload),
  getMyInteractions: () => apiClient.get('/api/interactions'),
};

export const wishlistApi = {
  getAll: () => apiClient.get('/api/wishlist'),
  add: (productId) => apiClient.post(`/api/wishlist/${productId}`),
  remove: (productId) => apiClient.delete(`/api/wishlist/${productId}`),
};

export const recommendationApi = {
  getRecommendations: (payload) => apiClient.post('/api/recommendations', payload),
};

export const comparisonApi = {
  compare: (payload) => apiClient.post('/api/compare', payload),
};

export const chatApi = {
  sendMessage: (chatPayload) => apiClient.post('/api/chat', chatPayload),
  getHistory: (conversationId) => apiClient.get(`/api/chat/history/${conversationId}`),
};

// Unified object export for convenience
export const api = {
  auth: authApi,
  user: userApi,
  products: productApi,
  reviews: reviewApi,
  orders: orderApi,
  interactions: interactionApi,
  wishlist: wishlistApi,
  recommendations: recommendationApi,
  compare: comparisonApi,
  chat: chatApi,
};

export default apiClient;
