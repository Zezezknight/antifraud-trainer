import type { QueryClient } from '@tanstack/react-query';
import { profileQuery } from '@/queries/profile';
import { scenariosQuery } from '@/queries/scenarios';
import { leaderboardQuery } from '@/queries/leaderboard';

export function profileLoader(queryClient: QueryClient) {
  return () => {
    queryClient
      .ensureQueryData(scenariosQuery<'buyer'>('buyer'))
      .catch(() => {});
    queryClient
      .ensureQueryData(scenariosQuery<'seller'>('seller'))
      .catch(() => {});
    queryClient.ensureQueryData(profileQuery()).catch(() => {});
    queryClient.ensureQueryData(leaderboardQuery()).catch(() => {});
  };
}
