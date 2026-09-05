import { Outlet } from 'react-router';
import '@/style.css';
import NavigationBar from '@/components/NavigationBar';

function NavigationBarLayout() {
  return (
    <>
      <NavigationBar />
      <Outlet />
    </>
  );
}

export default NavigationBarLayout;
