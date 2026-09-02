import type { QueryClient } from '@tanstack/react-query';
import { profileQuery } from '@/queries/profile';
import { scenariosQuery } from '@/queries/scenarios';
import { leaderboardQuery } from '@/queries/leaderboard';
import { processLoaderQueries } from '@/utils/loaders';

export function profileLoader(queryClient: QueryClient) {
  return async () => {
    const critical = [
      queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer')),
      queryClient.ensureQueryData(scenariosQuery<'seller'>('seller')),
      queryClient.ensureQueryData(profileQuery()),
    ];
    const nonCritical = [queryClient.ensureQueryData(leaderboardQuery())];

    await processLoaderQueries(critical, nonCritical);
  };
}
