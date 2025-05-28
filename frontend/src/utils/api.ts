import axios from 'axios';
import type { ApiResponse } from '../types';

const getApiBaseUrl = () => {
  // 環境変数が設定されている場合はそれを使用
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 現在のホスト名を確認
  const hostname = window.location.hostname;
  
  // localhostやIPアドレスの場合、同じホストでバックエンドアクセス
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3001/api`;
  }
  
  // デフォルトはlocalhost
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.MODE,
  viteApiUrl: import.meta.env.VITE_API_URL
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒タイムアウト
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    const token = localStorage.getItem('fanverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers,
      timeout: error.config?.timeout,
      isNetworkError: !error.response,
      isTimeoutError: error.code === 'ECONNABORTED'
    });
    
    // ネットワークエラーの詳細分析
    if (!error.response) {
      console.error('🌐 Network Error - Possible causes:', [
        'Backend server is not running',
        'CORS configuration issue',
        'Firewall blocking the request',
        'Wrong API URL configuration'
      ]);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('fanverse_token');
      localStorage.removeItem('fanverse_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: {
    email: string;
    username: string;
    displayName: string;
    password: string;
    userType: 'influencer' | 'fan';
  }) => {
    console.log('🔐 Attempting registration with data:', { ...userData, password: '[HIDDEN]' });
    try {
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    console.log('🔐 Attempting login with email:', credentials.email);
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData: {
    displayName: string;
    bio?: string;
    socialLinks?: any;
  }) => api.put('/users/profile', profileData),
  getUserByUsername: (username: string) => api.get(`/users/${username}`),
};

export const spaceAPI = {
  getTemplates: () => api.get('/spaces/templates'),
  createSpace: (spaceData: {
    title: string;
    description?: string;
    templateId: string;
  }) => api.post('/spaces', spaceData),
  getMySpaces: () => api.get('/spaces/my-spaces'),
  getSpace: (spaceId: string) => api.get(`/spaces/${spaceId}`),
  updateSpace: (spaceId: string, spaceData: any) =>
    api.put(`/spaces/${spaceId}`, spaceData),
  deleteSpace: (spaceId: string) => api.delete(`/spaces/${spaceId}`),
};

export default api; 