import type { LoaderFunctionArgs } from 'react-router';
import type { QueryClient } from '@tanstack/react-query';
import { dialogStartQuery } from '@/queries/dialog';
import { scenarioQuery } from '@/queries/scenarios';
import { processLoaderQueries } from '@/utils/loaders';

export function dialogLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { scenarioId: scenarioIdRow } = params;
    const scenarioId = Number(scenarioIdRow);

    const critical = [
      queryClient.ensureQueryData(dialogStartQuery(scenarioId)),
      queryClient.ensureQueryData(scenarioQuery(scenarioId)),
    ];
    const nonCritical: Promise<unknown>[] = [];

    await processLoaderQueries(critical, nonCritical);
  };
}
