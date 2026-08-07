import * as z from 'zod';

export const UserResponse = z.object({
  token: z.string(),
  user: z.object({
    user_id: z.string(),
    username: z.string(),
  }),
});

export const UserSchema = UserResponse.transform(data => ({
  token: data.token,
  id: data.user.user_id,
  name: data.user.username,
}));

export type User = z.infer<typeof UserSchema>;

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

export interface AuthUser {
  username: string;
  password: string;
}
