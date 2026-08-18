import { LeaderboardSchema } from '@/types/leaderboard';
import api from './api';
import * as z from 'zod';

export async function getLeaderboard() {
  const response = await api.get('/leaderboard');
  return z.array(LeaderboardSchema).parse(response.data);
}
