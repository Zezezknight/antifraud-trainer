import * as z from 'zod';

export const ScenarioResponse = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  role: z.string(),
  required_points: z.number(),
  is_available: z.boolean(),
});

export type ScenarioResponse = z.infer<typeof ScenarioResponse>;

export const ScenarioSchema = ScenarioResponse.transform(data => ({
  id: data.id,
  title: data.title,
  description: data.description,
  role: data.role,
  requiredPoints: data.required_points,
  isAvailable: data.is_available,
}));

export type Scenario = z.infer<typeof ScenarioSchema>;
