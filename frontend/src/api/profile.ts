import api from '@/api/api';
import { UserProfileSchema, type UserProfile } from '@/types/profile';

export async function getUserProfile(): Promise<UserProfile> {
  const response = await api.get('/users/me');
  return UserProfileSchema.parse(response.data);
}
