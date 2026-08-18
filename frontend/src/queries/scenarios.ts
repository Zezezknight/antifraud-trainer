import { getScenarioById, getScenarios } from '@/api/scenarios';
import type { Role } from '@/types/scenarios';
import { queryOptions } from '@tanstack/react-query';

export function scenariosQuery(role: Role) {
  return queryOptions({
    queryKey: ['scenarios', role],
    queryFn: () => getScenarios(role),
  });
}

export function scenarioQuery(id: number) {
  return queryOptions({
    queryKey: ['scenario', id],
    queryFn: () => getScenarioById(id),
  });
}
