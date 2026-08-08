import type { Leaderboard } from '@/types/leaderboard';
import { create } from 'zustand';

interface LeaderboardState {
  leaderboard: Leaderboard[];
  setLeaderboard: (leaderboard: Leaderboard[]) => void;
}

export const useLeaderboardStore = create<LeaderboardState>(set => ({
  leaderboard: [],
  setLeaderboard: leaderboard => set(() => ({ leaderboard })),
}));
