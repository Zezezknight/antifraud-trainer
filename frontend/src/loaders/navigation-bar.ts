import { profileQuery } from '@/queries/profile';
import type { QueryClient } from '@tanstack/react-query';

export function navigationBarLoader(queryClient: QueryClient) {
  return () => {
    queryClient.ensureQueryData(profileQuery()).catch(() => {});
  };
}
