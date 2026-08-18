import { getLeaderboard } from '@/api/leaderboard';
import { queryOptions } from '@tanstack/react-query';

export function leaderboardQuery() {
  return queryOptions({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(),
  });
}
