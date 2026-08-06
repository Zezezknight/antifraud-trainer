import { useUser } from '@/store/user';
import { Navigate, Outlet } from 'react-router';

function ProtectedRoutes() {
  const user = useUser();

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
