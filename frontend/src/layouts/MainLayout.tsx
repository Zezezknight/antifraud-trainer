import { Outlet } from 'react-router';
import '@/style.css';
import TopProgressBar from '@/components/TopProgressBar';

function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-muted flex flex-col">
      <TopProgressBar />
      <div className="flex flex-col gap-12 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
