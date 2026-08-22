import type { QueryClient } from '@tanstack/react-query';
import { scenariosQuery } from '@/queries/scenarios';

export function homeLoader(queryClient: QueryClient) {
  return async () => {
    await Promise.all([
      queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
      queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
    ]);
  };
}
