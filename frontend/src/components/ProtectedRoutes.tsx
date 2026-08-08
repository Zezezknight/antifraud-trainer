import { useAuth } from '@/hooks/auth';
import { clearUser } from '@/store/user';
import { isTokenExpired } from '@/utils/auth';
import { useEffect } from 'react';
import { Outlet } from 'react-router';

function ProtectedRoutes() {
  const { user } = useAuth();
  const token = user?.token ?? null;
  const isExpired = token ? isTokenExpired(token) : false;

  useEffect(() => {
    if (token && isExpired) {
      clearUser();
    }
  }, [token, isExpired]);

  return <Outlet />;
}

export default ProtectedRoutes;
