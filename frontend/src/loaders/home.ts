import { getScenarios } from '@/service/scenarios';

export async function homeLoader() {
  try {
    return await getScenarios();
  } catch {
    return [];
  }
}
