import type { Scenario } from '@/types/scenarios';
import { composeLoaders } from './utils';
import { scenarioLoader } from './loaders';
import type { LoaderFunctionArgs } from 'react-router';

export interface DialogLoader {
  scenario: Scenario;
}

export function dialogLoader({
  params,
}: LoaderFunctionArgs): Promise<DialogLoader> {
  const { scenarioId: scenarioIdRow } = params;
  const scenarioId = Number(scenarioIdRow);

  return composeLoaders({
    scenario: () => scenarioLoader(scenarioId),
  });
}
