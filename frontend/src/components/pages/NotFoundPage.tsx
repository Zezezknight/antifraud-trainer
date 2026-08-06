import logo from '@/assets/avito-antifraud-logo.svg';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

function NotFoundPage() {
  return (
    <main className="bg-primary min-h-screen flex justify-center py-12 text-background relative">
      <div className="container px-8">
        <img
          src={logo}
          alt="Avito-Antifraud Logo"
          className="absolute top-8 left-8 w-3/4 sm:w-auto"
        />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col gap-6">
            <span className="text-7xl sm:text-9xl font-extrabold">404</span>
            <span className="text-2xl sm:text-4xl font-bold">
              Страница не найдена
            </span>
            <Link to="/" className="flex items-center gap-2 hover:underline">
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-2xl">Вернуться на главную</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;
