import type { LoaderFunctionArgs } from 'react-router';
import type { QueryClient } from '@tanstack/react-query';
import { dialogStartQuery } from '@/queries/dialog';
import { scenarioQuery } from '@/queries/scenarios';
import { mapLoaderError } from '@/utils/loaders';

export function dialogLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { scenarioId: scenarioIdRow } = params;
    const scenarioId = Number(scenarioIdRow);

    try {
      await Promise.all([
        queryClient.ensureQueryData(dialogStartQuery(scenarioId)),
        queryClient.ensureQueryData(scenarioQuery(scenarioId)),
      ]);
    } catch (err) {
      mapLoaderError(err);
    }
  };
}
