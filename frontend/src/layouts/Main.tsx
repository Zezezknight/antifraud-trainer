import { Outlet } from 'react-router';
import '@/style.css';

function Main() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Outlet />
    </div>
  );
}

export default Main;
