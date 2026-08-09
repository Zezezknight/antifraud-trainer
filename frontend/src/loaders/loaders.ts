import { getUserProfile } from '@/service/profile';
import { useUserProfileStore } from '@/store/profile';
import type { UserProfile } from '@/types/profile';
import { getScenarios } from '@/service/scenarios';
import { useScenariosStore } from '@/store/scenarios';
import type { Scenario, Role } from '@/types/scenarios';

import { createCachedLoader } from './utils';
import type { Leaderboard } from '@/types/leaderboard';
import { useLeaderboardStore } from '@/store/leaderboard';
import { getLeaderboard } from '@/service/leaderboard';

export function userProfileLoader(): Promise<UserProfile> {
  return createCachedLoader<UserProfile>({
    getSnapshot: () => useUserProfileStore.getState().profile,
    setSnapshot: profile => useUserProfileStore.getState().setProfile(profile),
    fetcher: getUserProfile,
    onError: error => console.error('Ошибка загрузки профиля:', error),
  })();
}

export function scenariosLoader<R extends Role>(
  role: R,
): Promise<Scenario<R>[]> {
  return createCachedLoader<Scenario<R>[]>({
    getSnapshot: () => {
      const state = useScenariosStore.getState();
      // Возвращаем данные только если полный список был загружен
      return state.isFullyLoaded[role] ? state.scenarios[role] : null;
    },
    setSnapshot: value => {
      useScenariosStore.getState().setScenarios(role, value);
    },
    fetcher: () => getScenarios<R>(role),
    onError: error =>
      console.error(`Ошибка загрузки сценариев (${role}):`, error),
  })();
}

export function leaderboardLoader(): Promise<Leaderboard[]> {
  return createCachedLoader({
    getSnapshot: () => {
      const { leaderboard } = useLeaderboardStore.getState();
      return leaderboard.length > 0 ? leaderboard : null;
    },
    setSnapshot: value => {
      useLeaderboardStore.getState().setLeaderboard(value);
    },
    fetcher: () => getLeaderboard(),
    onError: error => console.error('Ошибка загрузки таблицы лидеров: ', error),
  })();
}
