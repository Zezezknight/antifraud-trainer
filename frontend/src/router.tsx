import { createBrowserRouter } from 'react-router';
import App from './App';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoutes from './components/ProtectedRoutes';
import Home from './pages/Home';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        // Защищенный сектор сайта (требуется авторизация пользователя)
        element: <ProtectedRoutes />,
        children: [
          {
            index: true, // Главная страница (/)
            element: <Home />,
          },
        ],
      },
      {
        path: '/login', // Страница входа в аккаунт
        element: <LoginPage />,
      },
      {
        path: '*', // Несуществующие адреса (404)
        element: <NotFoundPage />,
      },
    ],
  },
]);
