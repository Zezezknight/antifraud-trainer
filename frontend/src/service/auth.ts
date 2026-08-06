import { isUser, UserResponse, type AuthUser, type User } from '@/types';
import axios, { AxiosHeaders } from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(config => {
  const authStorage = localStorage.getItem('auth-storage');

  if (!authStorage) {
    return config;
  }

  const parsed = JSON.parse(authStorage) as {
    state: {
      user: User;
    };
  };

  if (isUser(parsed.state.user)) {
    const token = parsed.state.user.token;

    if (token) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
  }

  return config;
});

export async function registerUser(data: AuthUser): Promise<UserResponse> {
  const response = await api.post('/auth/register', data);
  const userData: UserResponse = UserResponse.parse(response.data);
  return userData;
}

export async function loginUser(data: AuthUser): Promise<UserResponse> {
  const response = await api.post('/auth/login', data);
  const userData: UserResponse = UserResponse.parse(response.data);
  return userData;
}
