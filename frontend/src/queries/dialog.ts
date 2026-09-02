import { getDialogStart, getDialogStep, sendDialogResults } from '@/api/dialog';
import type { OptionStatus } from '@/types/dialog';
import { queryOptions, useMutation } from '@tanstack/react-query';

export const dialogQueryKeyRoot = ['dialog'] as const;

export function dialogStartQuery(scenarioId: number) {
  return queryOptions({
    queryKey: [...dialogQueryKeyRoot, scenarioId, 'start'],
    queryFn: () => getDialogStart(scenarioId),
    staleTime: Infinity,
  });
}

export function useDialogStepMutation() {
  return useMutation({
    mutationFn: ({
      scenarioId,
      optionId,
    }: {
      scenarioId: number;
      optionId: number;
    }) => getDialogStep(scenarioId, optionId),
  });
}

export function useSendDialogResultsMutation() {
  return useMutation({
    mutationFn: ({
      scenarioId,
      status,
    }: {
      scenarioId: number;
      status: OptionStatus;
    }) => sendDialogResults(scenarioId, status),
  });
}
