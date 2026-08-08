import { useAuth } from '@/hooks/auth';
import { clearUser } from '@/store/user';
import { isTokenExpired } from '@/utils/auth';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

function ProtectedRoutes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token ?? null;
  const isExpired = token ? isTokenExpired(token) : false;

  useEffect(() => {
    if (token && isExpired) {
      clearUser();
      void navigate('/login', { replace: true });
    }
  }, [token, isExpired, navigate]);

  return <Outlet />;
}

export default ProtectedRoutes;
