import * as z from 'zod';

export const DIFFICULTIES = ['easy', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const ROLES = ['buyer', 'seller'] as const;
export type Role = (typeof ROLES)[number];

export const ScenarioResponse = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  role: z.enum(ROLES),
  difficulty: z.enum(DIFFICULTIES),
  best_score: z.number().nullable(),
  required_scenarios_this_level: z.number(),
  is_available: z.boolean(),
});

export const ScenarioSchema = ScenarioResponse.transform(data => ({
  id: data.id,
  title: data.title,
  description: data.description,
  icon: data.icon,
  role: data.role,
  difficulty: data.difficulty,
  bestScore: data.best_score,
  requiredScenariosThisLevel: data.required_scenarios_this_level,
  isAvailable: data.is_available,
}));

type BaseScenario = z.infer<typeof ScenarioSchema>;

export type Scenario<T extends Role = Role> = Omit<BaseScenario, 'role'> & {
  role: T;
};
