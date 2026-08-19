import type { QueryClient } from '@tanstack/react-query';
import { profileQuery } from '@/queries/profile';
import { scenariosQuery } from '@/queries/scenarios';
import { leaderboardQuery } from '@/queries/leaderboard';

export function profileLoader(queryClient: QueryClient) {
  return async () => {
    queryClient.ensureQueryData(leaderboardQuery()).catch(() => {});

    await Promise.all([
      queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
      queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
      queryClient.ensureQueryData(profileQuery()),
    ]);
  };
}
