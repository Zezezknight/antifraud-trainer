import api from '@/service/api';
import * as z from 'zod';
import { ScenarioSchema, type Role, type Scenario } from '@/types/scenarios';

export async function getScenarios<T extends Role>(
  role: Role,
): Promise<Scenario<T>[]> {
  const response = await api.get(`/scenarios?role=${role}`);
  return z.array(ScenarioSchema).parse(response.data) as Scenario<T>[];
}
