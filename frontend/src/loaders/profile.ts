import type { QueryClient } from '@tanstack/react-query';
import { profileQuery } from '@/queries/profile';
import { scenariosQuery } from '@/queries/scenarios';
import { leaderboardQuery } from '@/queries/leaderboard';

export function profileLoader(queryClient: QueryClient) {
  return () => {
    const buyer = queryClient.ensureQueryData(scenariosQuery<'buyer'>('buyer'));
    const seller = queryClient.ensureQueryData(
      scenariosQuery<'seller'>('seller'),
    );
    const profile = queryClient.ensureQueryData(profileQuery());
    const leaderboard = queryClient.ensureQueryData(leaderboardQuery());

    return { buyer, seller, profile, leaderboard };
  };
}
