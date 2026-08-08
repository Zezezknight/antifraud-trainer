import { USER_STATUSES } from '@/types/profile';
import * as z from 'zod';

const LeaderboardResponse = z.object({
  rank: z.number(),
  user_id: z.string(),
  username: z.string(),
  points: z.number(),
  status: z.enum(USER_STATUSES),
});

export const LeaderboardSchema = LeaderboardResponse.transform(data => ({
  rank: data.rank,
  user: {
    id: data.user_id,
    name: data.username,
  },
  points: data.points,
  status: data.status,
}));

export type Leaderboard = z.infer<typeof LeaderboardSchema>;
