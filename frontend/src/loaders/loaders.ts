import { getUserProfile } from '@/service/profile';
import { useUserProfileStore } from '@/store/profile';
import type { UserProfile } from '@/types/profile';
import { getScenarioById, getScenarios } from '@/service/scenarios';
import { useScenariosStore } from '@/store/scenarios';
import type { Scenario, Role } from '@/types/scenarios';

import { createCachedLoader } from './utils';
import type { Leaderboard } from '@/types/leaderboard';
import { useLeaderboardStore } from '@/store/leaderboard';
import { getLeaderboard } from '@/service/leaderboard';
import { checkTokenValidity } from '@/utils/auth';

export function userProfileLoader(): Promise<UserProfile> {
  const tokenCheck = checkTokenValidity();
  if (tokenCheck) throw tokenCheck;

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
  const tokenCheck = checkTokenValidity();
  if (tokenCheck) throw tokenCheck;

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

export function scenarioLoader(scenarioId: number) {
  if (!Number.isFinite(scenarioId)) {
    throw new Response('Not Found', { status: 404 });
  }

  const tokenCheck = checkTokenValidity();
  if (tokenCheck) throw tokenCheck;

  return createCachedLoader({
    getSnapshot: () => {
      const { buyer, seller } = useScenariosStore.getState().scenarios;
      const allScenarios = [...buyer, ...seller];
      return allScenarios.find(scenario => scenario.id === scenarioId) ?? null;
    },
    setSnapshot: value => {
      useScenariosStore.getState().addScenario(value.role, value);
    },
    fetcher: () => getScenarioById(scenarioId),
    onError: error => {
      console.error(`Ошибка загрузки сценария с ID=${scenarioId}:`, error);
    },
  })().catch(() => {
    throw new Response('Not Found', { status: 404 });
  });
}

export function leaderboardLoader(): Promise<Leaderboard[]> {
  const tokenCheck = checkTokenValidity();
  if (tokenCheck) throw tokenCheck;

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
