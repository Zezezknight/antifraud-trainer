import { createBrowserRouter, redirect } from 'react-router';
import Main from './layouts/Main';
import NotFoundPage from './pages/NotFound';
import ProtectedRoutes from './components/ProtectedRoutes';
import Home from './pages/Home';
import HydrateFallbackPage from './pages/HydrateFallback';
import { LoginForm } from './components/LoginForm';
import Auth from './layouts/Auth';
import { RegisterForm } from './components/RegisterForm';
import { homeLoader } from './loaders/home';
import Profile from './pages/Profile';
import { profileLoader } from './loaders/profile';
import { getTokenFromLocalStorage, isTokenExpired } from '@/utils/auth';
import Dialog from './pages/Dialog';
import { dialogLoader } from './loaders/dialog';

export const router = createBrowserRouter([
  {
    element: <Main />, // Главный Layout
    hydrateFallbackElement: <HydrateFallbackPage />,
    children: [
      {
        // Защищенный сектор сайта (требуется авторизация пользователя)
        element: <ProtectedRoutes />,
        loader: () => {
          const token = getTokenFromLocalStorage();
          const isExpired = isTokenExpired(token);

          // Если токена нет или он просрочен, прерываем цепочку и редиректим
          if (!token || isExpired) {
            return redirect('/login');
          }

          return null; // Пропускаем дальше к дочерним лоадерам
        },
        children: [
          {
            index: true, // Главная страница (/)
            element: <Home />,
            loader: homeLoader,
          },
          {
            path: '/profile',
            element: <Profile />,
            loader: profileLoader,
          },
          {
            path: '/scenarios/:scenarioId',
            element: <Dialog />,
            loader: dialogLoader,
            errorElement: <NotFoundPage />,
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
