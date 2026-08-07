import * as z from 'zod';

export interface User {
  token: string;
  id: string;
  name: string;
}

export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'token' in value &&
    typeof value.token === 'string' &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

export const UserResponse = z.object({
  token: z.string(),
  user: z.object({
    user_id: z.string(),
    username: z.string(),
  }),
});

export type UserResponse = z.infer<typeof UserResponse>;

export interface AuthUser {
  username: string;
  password: string;
}

export const USER_STATUSES = [
  'Новичок',
  'Внимательный',
  'Бдительный',
  'Эксперт безопасности',
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const UserProfileResponse = z.object({
  user_id: z.string(),
  username: z.string(),
  points: z.number(),
  status: z.enum(USER_STATUSES),
  completed_easy_scenarios: z.number(),
  completed_hard_scenarios: z.number(),
});

export const UserProfileSchema = UserProfileResponse.transform(data => ({
  userId: data.user_id,
  username: data.username,
  points: data.points,
  status: data.status,
  completedEasyScenarios: data.completed_easy_scenarios,
  completedHardScenarios: data.completed_hard_scenarios,
}));

export type UserProfile = z.infer<typeof UserProfileSchema>;
