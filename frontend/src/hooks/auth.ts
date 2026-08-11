import { useUser, useUserHydrated } from '@/store/user';
import { isTokenExpired } from '@/utils/auth';

export function useAuth() {
  const user = useUser();
  const isHydrated = useUserHydrated();
  const isAuth = user !== null && !isTokenExpired(user.token);

  return {
    user,
    isAuth,
    isHydrated,
  };
}
