import { getUserProfile } from '@/service/profile';
import { getScenarios } from '@/service/scenarios';
import { useUserProfileStore } from '@/store/profile';
import { useScenariosStore } from '@/store/scenarios';
import type { UserProfile } from '@/types/profile';
import type { Scenario } from '@/types/scenarios';

export interface HomeLoader {
  profile: UserProfile;
  seller: Scenario<'seller'>[];
  buyer: Scenario<'buyer'>[];
}

export async function homeLoader() {
  const [profile, scenarios] = await Promise.all([
    userProfileLoader(),
    scenariosLoader(),
  ]);

  return { profile, ...scenarios };
}

async function scenariosLoader(): Promise<{
  buyer: Scenario<'buyer'>[];
  seller: Scenario<'seller'>[];
}> {
  try {
    const { scenarios, setScenarios } = useScenariosStore.getState();

    const [buyer, seller] = await Promise.all([
      scenarios.buyer.length > 0
        ? scenarios.buyer
        : getScenarios<'buyer'>('buyer').then(items => {
            setScenarios('buyer', items);
            return items;
          }),
      scenarios.seller.length > 0
        ? scenarios.seller
        : getScenarios<'seller'>('seller').then(items => {
            setScenarios('seller', items);
            return items;
          }),
    ]);

    return { buyer, seller };
  } catch (error) {
    console.error('Ошибка загрузки сценариев:', error);
    return { buyer: [], seller: [] };
  }
}

async function userProfileLoader(): Promise<UserProfile> {
  const { profile, setProfile } = useUserProfileStore.getState();

  if (profile !== null) {
    return profile;
  }

  try {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    return userProfile;
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    throw error;
  }
}
