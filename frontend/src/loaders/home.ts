import type { QueryClient } from '@tanstack/react-query';
import { scenariosQuery } from '@/queries/scenarios';
import { mapLoaderError } from '@/utils/loaders';

export function homeLoader(queryClient: QueryClient) {
  return async () => {
    try {
      await Promise.all([
        queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
        queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
      ]);
    } catch (err) {
      mapLoaderError(err);
    }
  };
}
