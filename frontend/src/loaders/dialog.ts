import type { LoaderFunctionArgs } from 'react-router';
import type { QueryClient } from '@tanstack/react-query';
import { dialogStartQuery } from '@/queries/dialog';
import { scenarioQuery } from '@/queries/scenarios';

export function dialogLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { scenarioId: scenarioIdRow } = params;
    const scenarioId = Number(scenarioIdRow);

    const dialogStart = await queryClient.ensureQueryData(
      dialogStartQuery(scenarioId),
    );
    const scenario = queryClient.ensureQueryData(scenarioQuery(scenarioId));

    return { dialogStart, scenario };
  };
}
