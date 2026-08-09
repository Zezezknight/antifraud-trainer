import type { Scenario } from '@/types/scenarios';
import { composeLoaders } from './utils';
import { dialogStartLoader, scenarioLoader } from './loaders';
import type { LoaderFunctionArgs } from 'react-router';
import type { Dialog } from '@/types/dialog';

export interface DialogLoader {
  scenario: Scenario;
  dialogStart: Dialog;
}

export function dialogLoader({
  params,
}: LoaderFunctionArgs): Promise<DialogLoader> {
  const { scenarioId: scenarioIdRow } = params;
  const scenarioId = Number(scenarioIdRow);

  return composeLoaders({
    scenario: () => scenarioLoader(scenarioId),
    dialogStart: () => dialogStartLoader(scenarioId),
  });
}
