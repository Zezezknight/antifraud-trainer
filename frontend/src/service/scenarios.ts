import api from '@/service/api';
import * as z from 'zod';
import { ScenarioSchema, type Scenario } from '@/types/scenarios';

export async function getScenarios(): Promise<Scenario[]> {
  const response = await api.get('/scenarios');
  return z.array(ScenarioSchema).parse(response.data);
}
