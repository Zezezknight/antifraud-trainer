import logo from '@/assets/avito-antifraud-logo.svg';
import IconInCircle from '@/components/IconInCircle';
import { useAuth } from '@/hooks/auth';
import { ShieldCheck } from 'lucide-react';
import { Navigate, Outlet } from 'react-router';

const ListItem = ({ children }: { children: string }) => (
  <li className="flex items-center gap-2">
    <IconInCircle
      icon={<ShieldCheck className="text-primary" />}
      variants="sm"
      backgroundColor="bg-white"
    />
    {children}
  </li>
);

function Auth() {
  const { isAuth } = useAuth();

  if (isAuth) return <Navigate to="/" replace />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full ">
      <div className="flex flex-col gap-6 items-start justify-center flex-1/2 bg-primary relative p-8 pt-24 sm:p-12 sm:pt-24 text-white">
        <img
          src={logo}
          alt="Avito-Antifraud Logo"
          className="absolute top-8 left-8 sm:top-12 sm:left-12 w-1/2"
        />
        <h1 className="text-2xl md:text-4xl font-bold w-3/4">
          Научитесь распознавать мошенников за 5 минут
        </h1>
        <p className="text-md md:text-lg">
          Тренажёр безопасных сделок эмулирует реальную переписку на площадке
          объявлений. Проходите сценарии, ошибайтесь безопасно и прокачивайте
          бдительность.
        </p>
        <ul className="text-md md:text-lg flex flex-col gap-3">
          <ListItem>
            Реальные диалоги с мошенниками – без риска потерять деньги
          </ListItem>
          <ListItem>
            Разбор каждой ошибки и советы, как распознать обман
          </ListItem>
          <ListItem>Ранги и рейтинг: соревнуйтесь во внимательности</ListItem>
        </ul>
      </div>
      <div className="flex flex-1/2 justify-center items-center bg-muted pt-8 sm:pt-12">
        <Outlet />
      </div>
    </div>
  );
}

export default Auth;
