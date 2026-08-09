import * as z from 'zod';

export const USER_STATUSES = [
  'Новичок',
  'Внимательный',
  'Бдительный',
  'Эксперт безопасности',
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_CODES = USER_STATUSES.reduce(
  (acc, status, index) => {
    acc[status] = index;
    return acc;
  },
  {} as Record<UserStatus, number>,
);

export const USER_STATUSES_START_POINTS: Record<UserStatus, number> = {
  Новичок: 0,
  Внимательный: 100,
  Бдительный: 200,
  'Эксперт безопасности': 300,
};

export const UserProfileSchema = z
  .object({
    user_id: z.string(),
    username: z.string(),
    points: z.number(),
    status: z.enum(USER_STATUSES),
    completed_easy_scenarios: z.number(),
    completed_hard_scenarios: z.number(),
  })
  .transform(data => ({
    user: {
      id: data.user_id,
      name: data.username,
    },
    points: data.points,
    status: data.status,
    completedEasyScenarios: data.completed_easy_scenarios,
    completedHardScenarios: data.completed_hard_scenarios,
  }));

export type UserProfile = z.infer<typeof UserProfileSchema>;
