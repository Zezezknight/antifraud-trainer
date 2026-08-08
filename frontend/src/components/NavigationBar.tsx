import logo from '@/assets/avito-antifraud-logo-dark.svg';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserStatus } from '@/types/profile';

interface NavigationBarProps {
  points: number;
  status: UserStatus;
}

function NavigationBar({ points, status }: NavigationBarProps) {
  return (
    <div className="bg-muted shadow-sm py-4">
      <div className="container-box flex justify-between items-center">
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
            <span className="text-base font-bold">{points}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {status}
            </span>
          </div>
          <Avatar size="lg">
            <AvatarImage src={`/${status}.png`} />
            <AvatarFallback>{status}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
}

export default NavigationBar;
