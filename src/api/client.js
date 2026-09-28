import axios from 'axios';

// One shared axios instance for the whole app.
// baseURL means every call just needs "/users/login", not the full URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1234/api',
});

// REQUEST interceptor: runs before every request leaves the browser.
// Attaches the saved access token so protected routes work automatically —
// you never have to manually add the header in every API call.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor: runs after every response comes back.
// If the backend says 401 (token expired/invalid), we can't trust the
// session anymore — clear it and send the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
