import { useAuth } from '@/hooks/auth';
import HydrateFallbackPage from '@/pages/HydrateFallback';
import { Navigate, Outlet } from 'react-router';

function ProtectedRoutes() {
  const { isAuth, isHydrated } = useAuth();

  if (!isHydrated) return <HydrateFallbackPage />;

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoutes;
