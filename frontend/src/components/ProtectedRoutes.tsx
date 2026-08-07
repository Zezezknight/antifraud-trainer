import { useAuth } from '@/hooks/auth';
import HydrateFallbackPage from '@/pages/HydrateFallback';
import { clearUser } from '@/store/user';
import { isTokenExpired } from '@/utils/auth';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';

function ProtectedRoutes() {
  const { user, isAuth, isHydrated } = useAuth();
  const token = user?.token ?? null;
  const isExpired = token ? isTokenExpired(token) : false;

  useEffect(() => {
    if (token && isExpired) {
      clearUser();
    }
  }, [token, isExpired]);

  if (!isHydrated) return <HydrateFallbackPage />;

  return !isAuth || isExpired ? <Navigate to="/login" replace /> : <Outlet />;
}

export default ProtectedRoutes;
