import { UserResponse, type AuthUser } from '@/types/user';
import api from '@/service/api';
import { AUTH_STORAGE_KEY } from '@/store/user';

export function getTokenFromLocalStorage(): string | null {
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

export async function registerUser(data: AuthUser): Promise<UserResponse> {
  const response = await api.post('/auth/register', data);
  return UserResponse.parse(response.data);
}

export async function loginUser(data: AuthUser): Promise<UserResponse> {
  const response = await api.post('/auth/login', data);
  return UserResponse.parse(response.data);
}
