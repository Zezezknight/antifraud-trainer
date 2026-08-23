import type { QueryClient } from '@tanstack/react-query';
import { profileQuery } from '@/queries/profile';
import { scenariosQuery } from '@/queries/scenarios';
import { leaderboardQuery } from '@/queries/leaderboard';
import { mapLoaderError } from '@/utils/loaders';

export function profileLoader(queryClient: QueryClient) {
  return async () => {
    queryClient.ensureQueryData(leaderboardQuery()).catch(() => {});

    try {
      await Promise.all([
        queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
        queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
        queryClient.ensureQueryData(profileQuery()),
      ]);
    } catch (err) {
      mapLoaderError(err);
    }
  };
}
