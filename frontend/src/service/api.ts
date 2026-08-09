import axios, { AxiosHeaders } from 'axios';
import { getAuthToken, clearUser, AUTH_STORAGE_KEY } from '@/store/user';
import { getTokenFromLocalStorage } from '@/utils/auth';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(config => {
  const token = getAuthToken() ?? getTokenFromLocalStorage();

  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;

  return config;
});

// Обработка ошибок 401 (токен истёк или невалиден)
api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearUser();
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.location.href = '/login';
    }

    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

export default api;
