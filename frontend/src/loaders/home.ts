import type { QueryClient } from '@tanstack/react-query';
import { scenariosQuery } from '@/queries/scenarios';
import { profileQuery } from '@/queries/profile';

export function homeLoader(queryClient: QueryClient) {
  return async () => {
    queryClient.ensureQueryData(profileQuery()).catch(() => {});

    await Promise.all([
      queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
      queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
    ]);
  };
}
