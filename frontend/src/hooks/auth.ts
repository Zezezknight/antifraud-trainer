import { useUser, useUserHydrated } from '@/store/user';

export function useAuth() {
  const user = useUser();
  const isHydrated = useUserHydrated();
  const isAuth = user !== null;

  return {
    user,
    isAuth,
    isHydrated,
  };
}
