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
