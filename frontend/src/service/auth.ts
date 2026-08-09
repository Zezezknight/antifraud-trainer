import { UserSchema, type AuthUser, type User } from '@/types/user';
import api from '@/service/api';

export async function registerUser(data: AuthUser): Promise<User> {
  const response = await api.post('/auth/register', data);
  return UserSchema.parse(response.data);
}

export async function loginUser(data: AuthUser): Promise<User> {
  const response = await api.post('/auth/login', data);
  return UserSchema.parse(response.data);
}
