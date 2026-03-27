import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './authService';
import { notification } from 'antd'; // Antd global notification

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Global UX Improvement: Show success notification if API sends a message (e.g. "Employee created")
    if (response.data && response.data.success && response.data.message && response.config.method !== 'get') {
      notification.success({
        message: 'Success',
        description: response.data.message,
        placement: 'topRight',
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        clearTokens();
        // Option to trigger a global event or redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const plainAxios = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
        const res = await plainAxios.post('/api/auth/refresh', { refreshToken });
        
        if (res.data?.success && res.data?.data?.accessToken) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          setAccessToken(accessToken);
          if (newRefreshToken) setRefreshToken(newRefreshToken);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Global UX Improvement: Show error notifications based on standard API envelope
    if (error.response && error.response.data && error.response.data.message && error.config.url !== '/api/auth/me') {
        notification.error({
            message: 'Error',
            description: error.response.data.message,
            placement: 'topRight',
        });
    } else if (error.message === 'Network Error') {
        notification.error({
            message: 'Network Offline',
            description: 'Please check your internet connection.',
            placement: 'topRight',
            duration: 0, // Persistent until closed
        });
    }

    return Promise.reject(error);
  }
);

export default api;
