import type { QueryClient } from '@tanstack/react-query';
import { scenariosQuery } from '@/queries/scenarios';
import { profileQuery } from '@/queries/profile';

export function homeLoader(queryClient: QueryClient) {
  return async () => {
    const [buyer, seller] = await Promise.all([
      queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
      queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
    ]);
    const profile = queryClient.ensureQueryData(profileQuery());

    return { buyer, seller, profile };
  };
}
