import api from '@/api/api';
import * as z from 'zod';
import { ScenarioSchema, type Role, type Scenario } from '@/types/scenarios';

export async function getScenarios<T extends Role>(
  role: Role,
): Promise<Scenario<T>[]> {
  const response = await api.get(`/scenarios?role=${role}`);
  return z.array(ScenarioSchema).parse(response.data) as Scenario<T>[];
}

export async function getScenarioById(id: number): Promise<Scenario> {
  const response = await api.get(`/scenarios/${id}`);
  return ScenarioSchema.parse(response.data);
}
