import { getUserProfile } from '@/api/profile';
import { queryOptions } from '@tanstack/react-query';

export const profileQueryKeyRoot = ['profile'] as const;

export function profileQuery() {
  return queryOptions({
    queryKey: [...profileQueryKeyRoot],
    queryFn: getUserProfile,
  });
}
