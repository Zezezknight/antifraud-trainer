import {
  DialogSchema,
  FINAL_SCORE,
  type Dialog,
  type OptionStatus,
} from '@/types/dialog';
import api from './api';

export async function getDialogStart(scenarioId: number): Promise<Dialog> {
  const response = await api.get(`/scenarios/${scenarioId}/start`);
  return DialogSchema.parse(response.data);
}

export async function getDialogStep(
  scenarioId: number,
  optionId: number,
): Promise<Dialog> {
  const response = await api.post(`/scenarios/${scenarioId}/step`, {
    option_id: optionId,
  });
  return DialogSchema.parse(response.data);
}

export async function sendDialogResults(
  scenarioId: number,
  status: OptionStatus,
) {
  await api.post(`/scenarios/${scenarioId}/finish`, {
    status,
    score: FINAL_SCORE[status],
  });
}
