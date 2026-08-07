import axios, { AxiosHeaders } from 'axios';
import { AUTH_STORAGE_KEY, getAuthToken } from '@/store/user';

function getTokenFromLocalStorage(): string | null {
  try {
    const storage = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storage) {
      return null;
    }

    const parsed = JSON.parse(storage) as {
      state?: { user?: { token?: string } };
    };
    return parsed?.state?.user?.token ?? null;
  } catch {
    return null;
  }
}

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

export default api;
