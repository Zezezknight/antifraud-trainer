import { getUserProfile } from '@/api/profile';
import { queryOptions } from '@tanstack/react-query';

export function profileQuery() {
  return queryOptions({
    queryKey: ['profile'],
    queryFn: () => getUserProfile(),
  });
}
