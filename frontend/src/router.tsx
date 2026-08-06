import { createBrowserRouter } from 'react-router';
import Main from './layouts/Main';
import NotFoundPage from './pages/NotFound';
import ProtectedRoutes from './components/ProtectedRoutes';
import Home from './pages/Home';
import HydrateFallbackPage from './pages/HydrateFallback';
import { LoginForm } from './components/LoginForm';
import Auth from './layouts/Auth';
import { RegisterForm } from './components/RegisterForm';

export const router = createBrowserRouter([
  {
    element: <Main />, // Главный Layout
    hydrateFallbackElement: <HydrateFallbackPage />,
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
        element: <Auth />, // Layout Авторизации
        children: [
          {
            path: '/login', // Страница входа в аккаунт
            element: <LoginForm />,
          },
          {
            path: '/register', // Страница регистрации аккаунта
            element: <RegisterForm />,
          },
        ],
      },
      {
        path: '*', // Несуществующие адреса (404)
        element: <NotFoundPage />,
      },
    ],
  },
]);
