import { useUser } from '@/store/user';
import { Navigate, Outlet } from 'react-router';

function ProtectedRoutes() {
  const user = useUser();
  const isAuth = user === null;

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoutes;
