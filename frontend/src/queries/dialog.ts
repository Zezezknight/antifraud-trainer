import { getDialogStart, getDialogStep, sendDialogResults } from '@/api/dialog';
import type { OptionStatus } from '@/types/dialog';
import { queryOptions, useMutation } from '@tanstack/react-query';

export function dialogStartQuery(scenarioId: number) {
  return queryOptions({
    queryKey: ['dialog', scenarioId, 'start'],
    queryFn: () => getDialogStart(scenarioId),
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
