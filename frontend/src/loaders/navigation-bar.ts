import { profileQuery } from '@/queries/profile';
import { processLoaderQueries } from '@/utils/loaders';
import type { QueryClient } from '@tanstack/react-query';

export function navigationBarLoader(queryClient: QueryClient) {
  return async () => {
    const critical: Promise<unknown>[] = [];
    const nonCritical = [queryClient.ensureQueryData(profileQuery())];

    await processLoaderQueries(critical, nonCritical);
  };
}
