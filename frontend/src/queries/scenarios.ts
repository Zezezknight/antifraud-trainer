import { getScenarioById, getScenarios } from '@/api/scenarios';
import type { Role } from '@/types/scenarios';
import { queryOptions } from '@tanstack/react-query';

export const scenariosQueryKeyRoot = ['scenarios'] as const;

export function scenariosQuery<T extends Role>(role: Role) {
  return queryOptions({
    queryKey: [...scenariosQueryKeyRoot, role],
    queryFn: () => getScenarios<T>(role),
  });
}

export const scenarioQueryKeyRoot = ['scenario'] as const;

export function scenarioQuery(scenarioId: number) {
  return queryOptions({
    queryKey: [...scenarioQueryKeyRoot, scenarioId],
    queryFn: () => getScenarioById(scenarioId),
  });
}
