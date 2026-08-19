import { createBrowserRouter, redirect, useLocation } from 'react-router';
import MainLayout from './layouts/MainLayout';
import NotFoundPage from './pages/NotFound';
import ProtectedRoutes from './components/ProtectedRoutes';
import Home from './pages/Home';
import HydrateFallbackPage from './pages/HydrateFallback';
import { LoginForm } from './components/LoginForm';
import AuthLayout from './layouts/AuthLayout';
import { RegisterForm } from './components/RegisterForm';
import { homeLoader } from './loaders/home';
import Profile from './pages/Profile';
import { profileLoader } from './loaders/profile';
import { getTokenFromLocalStorage, isTokenExpired } from '@/utils/auth';
import Dialog from './pages/Dialog';
import { dialogLoader } from './loaders/dialog';
import { AUTH_STORAGE_KEY, clearUser } from './store/user';
import { queryClient } from './query-client';

export const router = createBrowserRouter([
  {
    element: <MainLayout />, // Главный Layout
    children: [
      {
        // Защищенный сектор сайта (требуется авторизация пользователя)
        element: <ProtectedRoutes />,
        loader: () => {
          const token = getTokenFromLocalStorage();
          const isExpired = isTokenExpired(token);

          // Если токена нет или он просрочен, прерываем цепочку и редиректим
          if (!token || isExpired) {
            clearUser();
            localStorage.removeItem(AUTH_STORAGE_KEY);
            return redirect('/login');
          }

          return null; // Пропускаем дальше к дочерним лоадерам
        },
        children: [
          {
            index: true, // Главная страница (/)
            element: <Home />,
            loader: homeLoader(queryClient),
          },
          {
            path: '/profile',
            element: <Profile />,
            loader: profileLoader(queryClient),
          },
          {
            path: '/scenarios/:scenarioId',
            Component: () => {
              const location = useLocation();
              return <Dialog key={location.key} />;
            },
            loader: dialogLoader(queryClient),
            shouldRevalidate: () => true,
            errorElement: <NotFoundPage />,
          },
        ],
      },
      {
        element: <AuthLayout />, // Layout Авторизации
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
