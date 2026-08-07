import logo from '@/assets/avito-antifraud-logo-dark.svg';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function NavigationBar() {
  return (
    <div className="bg-muted shadow-sm py-4">
      <div className="container m-auto px-8 flex justify-between items-center">
        <Link to="/">
          <img
            src={logo}
            alt="Avito-Antifraud Logo"
            className="w-4/5 sm:w-2/3"
          />
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-border bg-background"
        >
          <div className="flex flex-col items-end">
            <span className="text-base font-bold">60</span>
            <span className="text-xs font-medium text-muted-foreground">
              Новичок
            </span>
          </div>
          <Avatar size="lg">
            <AvatarImage src="/1.png" />
            <AvatarFallback>Новичок</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
}

export default NavigationBar;
