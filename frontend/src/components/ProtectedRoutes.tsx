import { Outlet } from 'react-router';

function ProtectedRoutes() {
  return (
    <>
      <h1>Protected</h1>
      <Outlet />
    </>
  );
}

export default ProtectedRoutes;
