import { getLeaderboard } from '@/api/leaderboard';
import { queryOptions } from '@tanstack/react-query';

export const leaderboardQueryKeyRoot = ['leaderboard'] as const;

export function leaderboardQuery() {
  return queryOptions({
    queryKey: [...leaderboardQueryKeyRoot],
    queryFn: getLeaderboard,
  });
}
