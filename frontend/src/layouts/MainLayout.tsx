import { Outlet } from 'react-router';
import '@/style.css';
import TopProgressBar from '@/components/TopProgressBar';

function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-muted">
      <TopProgressBar />
      <div className="flex flex-col gap-12">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
