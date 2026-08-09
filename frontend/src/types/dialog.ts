import * as z from 'zod';

const OPTION_STATUSES = ['green', 'yellow', 'red'] as const;
export type OptionStatus = (typeof OPTION_STATUSES)[number];

const OPTION_FINAL_STATUSES = ['green', 'yellow', 'red', ''] as const;
export type OptionFinalStatus = (typeof OPTION_FINAL_STATUSES)[number];

export const DialogNodeSchema = z
  .object({
    id: z.number(),
    scenario_id: z.number(),
    message_text: z.string(),
    is_final: z.boolean(),
    final_status: z.enum(OPTION_FINAL_STATUSES),
  })
  .transform(data => ({
    id: data.id,
    scenarioId: data.scenario_id,
    messageText: data.message_text,
    isFinal: data.is_final,
    finalStatus: data.final_status,
  }));

export type DialogNode = z.infer<typeof DialogNodeSchema>;

export const DialogOptionSchema = z
  .object({
    id: z.number(),
    from_node_id: z.number(),
    to_node_id: z.number(),
    message_text: z.string(),
    feedback_text: z.string(),
    how_to_recognize_in_life: z.string(),
    status: z.enum(OPTION_STATUSES),
  })
  .transform(data => ({
    id: data.id,
    fromNodeId: data.from_node_id,
    toNodeId: data.to_node_id,
    messageText: data.message_text,
    feedbackText: data.feedback_text,
    howToRecognizeInLife: data.how_to_recognize_in_life,
    status: data.status,
  }));

export type DialogOption = z.infer<typeof DialogOptionSchema>;

export const DialogSchema = z
  .object({
    scenario_node: DialogNodeSchema,
    options: z.array(DialogOptionSchema),
  })
  .transform(data => ({
    scenarioNode: data.scenario_node,
    options: data.options,
  }));

export type Dialog = z.infer<typeof DialogSchema>;

export type DialogMessageType = 'opponent' | 'user';

export const FINAL_SCORE: Record<OptionStatus, number> = {
  green: 100,
  yellow: 50,
  red: 0,
};

export type DialogNodeWithType = DialogNode & {
  type: 'opponent';
};

export type DialogOptionWithType = DialogOption & {
  type: 'user';
};

export type DialogHistory = DialogNodeWithType | DialogOptionWithType;
