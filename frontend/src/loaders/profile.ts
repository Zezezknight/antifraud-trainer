import type { UserProfile } from '@/types/profile';
import { composeLoaders } from './utils';
import {
  leaderboardLoader,
  scenariosLoader,
  userProfileLoader,
} from './loaders';
import type { Leaderboard } from '@/types/leaderboard';
import type { Scenario } from '@/types/scenarios';

export interface ProfileLoader {
  profile: UserProfile;
  leaderboard: Leaderboard[];
  seller: Scenario<'seller'>[];
  buyer: Scenario<'buyer'>[];
}

export async function profileLoader(): Promise<ProfileLoader> {
  return composeLoaders({
    profile: userProfileLoader,
    leaderboard: leaderboardLoader,
    buyer: () => scenariosLoader('buyer'),
    seller: () => scenariosLoader('seller'),
  });
}
