import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Include cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log('Making request:', config.method?.toUpperCase(), config.url);
    console.log('Request headers:', config.headers);
    if (config.data) {
      console.log('Request data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Flag to prevent infinite redirect loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage before each request to ensure it's the latest
    const token = localStorage.getItem('token');
    console.log('Making request to:', config.url, 'with token:', token ? 'present' : 'missing');
    
    // Log token role if present (safely)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token role:', payload.role);
      } catch (e) {
        console.log('Could not parse token payload');
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 and it's not the retry request, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite redirect loops
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      processQueue(null, null);
      isRefreshing = false;
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
};

// Order API calls
export const orderAPI = {
  // Publisher endpoints
  getDashboard: () => api.get('/orders/dashboard'),
  getPublisherOrders: (params = {}) => api.get('/orders/publisher', { params }),
  approveOrder: (orderId, data) => api.put(`/orders/${orderId}/approve`, data),
  rejectOrder: (orderId, data) => api.put(`/orders/${orderId}/reject`, data),
  submitOrder: (orderId, data) => api.put(`/orders/${orderId}/submit`, data),
  
  // Advertiser endpoints
  createOrder: (orderData) => api.post('/orders', orderData),
  processOrderWithBalance: (cartData) => api.post('/orders/process-with-balance', cartData),
  
  // Shared endpoints
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}`),
  addMessage: (orderId, messageData) => api.post(`/orders/${orderId}/messages`, messageData),
  createOrderChat: (orderId) => api.post(`/orders/${orderId}/chat`),
  
  // Article data endpoints
  saveArticleData: (orderId, articleData) => api.post(`/orders/${orderId}/article`, articleData),
  getArticleData: (orderId) => api.get(`/orders/${orderId}/article`),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params, config = {}) => api.get('/admin/users', { params, ...config }),
  manageUser: (userId, data) => api.put(`/admin/users/${userId}/manage`, data),
  suspendUser: (userId, reason) => api.put(`/admin/users/${userId}/manage`, { action: 'suspend', reason }),
  activateUser: (userId) => api.put(`/admin/users/${userId}/manage`, { action: 'activate' }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  verifyUser: (userId) => api.put(`/admin/users/${userId}/verify`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  bulkUserAction: (userIds, action) => api.post('/admin/users/bulk-action', { userIds, action }),
  getPendingWebsites: (params) => api.get('/admin/websites/pending', { params }),
  getAllWebsites: (params) => api.get('/admin/websites', { params }), // Add this line
  reviewWebsite: (websiteId, data) => api.put(`/admin/websites/${websiteId}/review`, data),
  updateWebsiteVerificationSettings: (websiteId, data) => api.put(`/admin/websites/${websiteId}/verification-settings`, data),
  updateWebsiteMetrics: (websiteId, data) => api.put(`/admin/websites/${websiteId}/metrics`, data), // Add this line
  approveWebsite: (websiteId, data) => api.put(`/admin/websites/${websiteId}/approve`, data),
  rejectWebsite: (websiteId, data) => api.put(`/admin/websites/${websiteId}/reject`, data),
  pauseWebsite: (websiteId) => api.put(`/admin/websites/${websiteId}/pause`),
  deleteWebsite: (websiteId) => api.delete(`/admin/websites/${websiteId}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getFinancialOverview: (params) => api.get('/admin/finance', { params }),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getNotifications: () => api.get('/notification'),
  getAllChats: (params) => api.get('/admin/chats', { params }),
};

// Website API calls
export const websiteAPI = {
  checkExists: (domain) => {
    console.log('API: Checking if domain exists:', domain);
    return api.get(`/websites/check/${domain}`);
  },
  addWebsite: (websiteData) => {
    console.log('API: Adding website with data:', websiteData);
    return api.post('/websites', websiteData);
  },
  getUserWebsites: (params = {}) => api.get('/websites', { params }),
  getWebsite: (websiteId) => {
    console.log('API: Getting website with ID:', websiteId);
    return api.get(`/websites/${websiteId}`);
  },
  getWebsiteDetails: (websiteId) => {
    console.log('API: Getting website details with pricing for ID:', websiteId);
    return api.get(`/advertiser/websites/${websiteId}`);
  },
  updateWebsite: (websiteId, data) => api.put(`/websites/${websiteId}`, data),
  deleteWebsite: (websiteId) => api.delete(`/websites/${websiteId}`),
  
  // Verification endpoints
  initiateVerification: (websiteId, data) => {
    console.log('API: Initiating verification for website ID:', websiteId, 'with data:', data);
    return api.post(`/websites/${websiteId}/verify/initiate`, data);
  },
  verifyWebsite: (websiteId, data) => api.post(`/websites/${websiteId}/verify`, data),
};

// Google Auth API calls
export const googleAuthAPI = {
  getAuthUrl: (websiteId, method) => api.get(`/auth/google/auth-url/${websiteId}?method=${method}`),
  verifyWithTokens: (websiteId, data) => api.post(`/auth/google/verify/${websiteId}`, data),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  updateRole: (newRole) => api.put('/user/role', { newRole }),
  uploadProfileImage: (formData) => api.post('/user/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// Chat API calls
export const chatAPI = {
  getChats: () => api.get('/chat'),
  createChat: (data) => api.post('/chat', data),
  getChatMessages: (chatId, params = {}) => api.get(`/chat/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chat/${chatId}/messages`, data),
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
  uploadFile: (chatId, formData) => api.post(`/chat/${chatId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  createSupportTicket: (data) => api.post('/chat/support', data),
  getSupportTickets: () => api.get('/chat/support')
};

// Advertiser API calls - RECONNECTED
export const advertiserAPI = {
  // Website browsing endpoints
  browseWebsites: (params = {}) => api.get('/advertiser/websites', { params }),
  getWebsiteDetails: (websiteId) => api.get(`/advertiser/websites/${websiteId}`),
  createWebsiteChat: (data) => api.post('/advertiser/websites/chat', data),
  addToFavorites: (websiteId) => api.post(`/advertiser/websites/${websiteId}/favorite`),
  removeFromFavorites: (websiteId) => api.delete(`/advertiser/websites/${websiteId}/favorite`),
  getFavorites: () => api.get('/advertiser/websites/favorites'),
  
  // Order endpoints
  createOrder: (orderData) => {
    console.log('Sending order data to /advertiser/orders:', orderData);
    // Let axios handle the Content-Type header
    return api.post('/advertiser/orders', orderData);
  },
  createBulkOrders: (bulkOrderData) => api.post('/advertiser/orders/bulk', bulkOrderData), // Added bulk order endpoint
  getOrders: (params = {}) => api.get('/advertiser/orders', { params }),
  getOrderDetails: (orderId) => api.get(`/advertiser/orders/${orderId}`),
  cancelOrder: (orderId) => api.put(`/advertiser/orders/${orderId}/cancel`),
  approveContent: (orderId) => api.put(`/advertiser/orders/${orderId}/approve`),
  requestRevision: (orderId, data) => api.put(`/advertiser/orders/${orderId}/revision`, data),
  
  // Analytics endpoints
  getOrderAnalytics: (params = {}) => api.get('/advertiser/analytics', { params }),
  
  // Dashboard endpoints
  getDashboard: () => api.get('/advertiser/dashboard'),
  // Fixed the notifications endpoint to use the correct path
  getNotifications: () => api.get('/notification'),
};

// Wallet API calls
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  addFunds: (amount) => api.post('/wallet/add-funds', { amount }),
  getTransactions: (params = {}) => api.get('/wallet/transactions', { params }),
  withdrawFunds: (amount, method, details) => api.post('/wallet/withdraw', { amount, method, details })
};

// Quality Assurance API calls
export const qualityAPI = {
  // Quality Check Management
  getQualityChecks: (params = {}) => api.get('/quality/checks', { params }),
  getQualityCheck: (qualityCheckId) => api.get(`/quality/checks/${qualityCheckId}`),
  createQualityCheck: (data) => api.post('/quality/checks', data),
  runAutomatedChecks: (qualityCheckId, data) => api.post(`/quality/checks/${qualityCheckId}/automated`, data),
  assignReviewer: (qualityCheckId) => api.put(`/quality/checks/${qualityCheckId}/assign`),
  startManualReview: (qualityCheckId) => api.put(`/quality/checks/${qualityCheckId}/start-review`),
  completeManualReview: (qualityCheckId, data) => api.put(`/quality/checks/${qualityCheckId}/complete-review`, data),
  addComment: (qualityCheckId, data) => api.post(`/quality/checks/${qualityCheckId}/comments`, data),
  submitRevision: (qualityCheckId, data) => api.post(`/quality/checks/${qualityCheckId}/revision`, data),
  
  // Reviewer Management
  getMyQualityChecks: (params = {}) => api.get('/quality/checks/my', { params }),
  getOverdueQualityChecks: () => api.get('/quality/checks/overdue'),
  
  // Template Management
  getQualityTemplates: (params = {}) => api.get('/quality/templates', { params }),
  createQualityTemplate: (data) => api.post('/quality/templates', data),
  updateQualityTemplate: (templateId, data) => api.put(`/quality/templates/${templateId}`, data),
  deleteQualityTemplate: (templateId) => api.delete(`/quality/templates/${templateId}`),
  
  // Analytics
  getQualityAnalytics: (params = {}) => api.get('/quality/analytics', { params })
};

// File Management API calls
export const fileAPI = {
  uploadFiles: (formData, endpoint = '/upload') => api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  getFile: (fileId) => api.get(`/files/${fileId}`),
  getUserFiles: (params = {}) => api.get('/files', { params })
};

// Notification API calls
export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notification', { params }),
  markAsRead: (notificationId) => api.put(`/notification/${notificationId}/read`),
  markAllAsRead: () => api.put('/notification/read-all'),
  archiveNotification: (notificationId) => api.put(`/notification/${notificationId}/archive`),
  deleteNotification: (notificationId) => api.delete(`/notification/${notificationId}`),
  getUnreadCount: () => api.get('/notification/unread-count'),
  getPreferences: () => api.get('/notification/preferences'),
  updatePreferences: (preferencesData) => api.put('/notification/preferences', preferencesData)
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const handleApiSuccess = (response) => {
  return response.data;
};

// Default export
export default api;