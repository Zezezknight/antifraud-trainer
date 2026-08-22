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
import HomePageSkeleton from './components/skeletons/HomePageSkeleton';
import NavigationBarLayout from './layouts/NavigationBarLayout';
import ProfilePageSkeleton from './components/skeletons/ProfilePageSkeleton';
import DialogPageSkeleton from './components/skeletons/DialogPageSkeleton';
import { navigationBarLoader } from './loaders/navigation-bar';

export const router = createBrowserRouter([
  {
    element: <MainLayout />, // Главный Layout
    children: [
      {
        // Защищенный сектор сайта (требуется авторизация пользователя)
        element: <ProtectedRoutes />,
        hydrateFallbackElement: <HydrateFallbackPage />,
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
            // Страницы, которые используют внутри себя навигационное меню
            element: <NavigationBarLayout />,
            loader: navigationBarLoader(queryClient),
            children: [
              {
                index: true, // Главная страница (/)
                element: <Home />,
                hydrateFallbackElement: <HomePageSkeleton />,
                loader: homeLoader(queryClient),
              },
              {
                path: '/profile',
                element: <Profile />,
                hydrateFallbackElement: <ProfilePageSkeleton />,
                loader: profileLoader(queryClient),
              },
            ],
          },
          {
            // Страницы, которые НЕ используют внутри себя навигационное меню
            children: [
              {
                path: '/scenarios/:scenarioId',
                Component: () => {
                  const location = useLocation();
                  return <Dialog key={location.key} />;
                },
                hydrateFallbackElement: <DialogPageSkeleton />,
                loader: dialogLoader(queryClient),
                shouldRevalidate: () => true,
                errorElement: <NotFoundPage />,
              },
            ],
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
