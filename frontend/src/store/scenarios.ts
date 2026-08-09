import type { Role, Scenario } from '@/types/scenarios';
import { create } from 'zustand';

interface ScenariosState {
  scenarios: {
    [R in Role]: Scenario<R>[];
  };
  // Флаги, указывающие был ли загружен полный список для каждой роли
  isFullyLoaded: Record<Role, boolean>;
  setScenarios: <R extends Role>(role: R, scenarios: Scenario<R>[]) => void;
  addScenario: <R extends Role>(role: R, scenario: Scenario<R>) => void;
  invalidateRole: (role: Role) => void;
}

export const useScenariosStore = create<ScenariosState>(set => ({
  scenarios: {
    buyer: [],
    seller: [],
  },
  isFullyLoaded: {
    buyer: false,
    seller: false,
  },
  setScenarios: (role, scenarios) =>
    set(state => ({
      scenarios: {
        ...state.scenarios,
        [role]: scenarios,
      },
      // Отмечаем, что полный список был загружен
      isFullyLoaded: {
        ...state.isFullyLoaded,
        [role]: true,
      },
    })),
  addScenario: (role, scenario) =>
    set(state => {
      // Проверяем, не добавлен ли уже этот сценарий
      if (state.scenarios[role].find(s => s.id === scenario.id)) {
        return state;
      }

      return {
        scenarios: {
          ...state.scenarios,
          [role]: [...state.scenarios[role], scenario],
        },
      };
    }),
  invalidateRole: role =>
    set(state => ({
      isFullyLoaded: {
        ...state.isFullyLoaded,
        [role]: false,
      },
    })),
}));

export const useScenarios = () => useScenariosStore(state => state.scenarios);
export const useSetScenarios = () =>
  useScenariosStore(state => state.setScenarios);
export const useInvalidateRole = () =>
  useScenariosStore(state => state.invalidateRole);
