import { getScenarioById, getScenarios } from '@/api/scenarios';
import type { Role } from '@/types/scenarios';
import { queryOptions } from '@tanstack/react-query';

export function scenariosQuery<T extends Role>(role: Role) {
  return queryOptions({
    queryKey: ['scenarios', role],
    queryFn: () => getScenarios<T>(role),
  });
}

export function scenarioQuery(id: number) {
  return queryOptions({
    queryKey: ['scenario', id],
    queryFn: () => getScenarioById(id),
  });
}
