import type { Role, Scenario } from '@/types/scenarios';
import { create } from 'zustand';

interface ScenariosState {
  scenarios: {
    [R in Role]: Scenario<R>[];
  };
  setScenarios: <R extends Role>(role: R, scenarios: Scenario<R>[]) => void;
}

export const useScenariosStore = create<ScenariosState>(set => ({
  scenarios: {
    buyer: [],
    seller: [],
  },
  setScenarios: (role, scenarios) =>
    set(state => ({
      scenarios: {
        ...state.scenarios,
        [role]: scenarios,
      },
    })),
}));

export const useScenarios = () => useScenariosStore(state => state.scenarios);
export const useSetScenarios = () =>
  useScenariosStore(state => state.setScenarios);
