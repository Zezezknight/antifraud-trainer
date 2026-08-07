import { UserResponse, type AuthUser } from '@/types/user';
import api from '@/service/api';

export async function registerUser(data: AuthUser): Promise<UserResponse> {
  const response = await api.post('/auth/register', data);
  return UserResponse.parse(response.data);
}

export async function loginUser(data: AuthUser): Promise<UserResponse> {
  const response = await api.post('/auth/login', data);
  return UserResponse.parse(response.data);
}
