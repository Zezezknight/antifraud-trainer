import { Outlet } from 'react-router';
import '@/style.css';

function Main() {
  return (
    <div className="flex min-h-screen w-full flex-col gap-12 bg-muted">
      <Outlet />
    </div>
  );
}

export default Main;
