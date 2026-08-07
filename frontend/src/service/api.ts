import axios, { AxiosHeaders } from 'axios';
import { getAuthToken } from '@/store/user';
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

export default api;
