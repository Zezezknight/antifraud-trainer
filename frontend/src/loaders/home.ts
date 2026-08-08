import type { UserProfile } from '@/types/profile';
import type { Scenario } from '@/types/scenarios';
import { composeLoaders } from './utils';
import { userProfileLoader } from './loaders';
import { scenariosLoader } from './loaders';

export interface HomeLoader {
  profile: UserProfile;
  seller: Scenario<'seller'>[];
  buyer: Scenario<'buyer'>[];
}

export async function homeLoader(): Promise<HomeLoader> {
  return composeLoaders({
    profile: userProfileLoader,
    buyer: () => scenariosLoader('buyer'),
    seller: () => scenariosLoader('seller'),
  });
}
