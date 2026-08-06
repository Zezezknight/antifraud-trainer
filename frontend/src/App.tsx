import { Outlet } from 'react-router';
import './style.css';

function App() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Outlet />
    </div>
  );
}

export default App;
