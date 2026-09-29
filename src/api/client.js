import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1234/api',
  withCredentials: true,
});

const refreshUrl = '/users/update-refresh-access';
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = api.put(refreshUrl).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

// Retry a failed request once after renewing the HTTP-only access cookie.
// Concurrent 401 responses share one refresh request instead of racing.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url === refreshUrl;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isRefreshRequest
    ) {
      if (isRefreshRequest && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshAccessToken();
      return api(originalRequest);
    } catch (refreshError) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;
