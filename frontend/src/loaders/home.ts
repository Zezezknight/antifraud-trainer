import type { QueryClient } from '@tanstack/react-query';
import { scenariosQuery } from '@/queries/scenarios';
import { processLoaderQueries } from '@/utils/loaders';

export function homeLoader(queryClient: QueryClient) {
  return async () => {
    const critical = [
      queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
      queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
    ];
    const nonCritical: Promise<unknown>[] = [];

    await processLoaderQueries(critical, nonCritical);
  };
}
