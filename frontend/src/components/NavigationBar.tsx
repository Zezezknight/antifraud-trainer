import logoDark from '@/assets/avito-antifraud-logo.svg';
import logoLight from '@/assets/avito-antifraud-logo-dark.svg';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserStatus } from '@/types/profile';
import { useTheme } from './ThemeProvider';
import { ModeToggle } from './ModeToggle';

interface NavigationBarProps {
  points: number;
  status: UserStatus;
}

function NavigationBar({ points, status }: NavigationBarProps) {
  const { theme } = useTheme();

  const getLogo = () => {
    if (theme === 'system') {
      const isDarkSystem = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      return isDarkSystem ? logoDark : logoLight;
    }
    return theme === 'dark' ? logoDark : logoLight;
  };

  return (
    <div className="bg-muted shadow-sm py-4">
      <div className="container-box flex justify-between items-center">
        <Link to="/">
          <img
            src={getLogo()}
            alt="Avito-Antifraud Logo"
            className="w-4/5 sm:w-2/3"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 sm:px-3 sm:py-1.5 rounded-2xl border-2 border-border bg-background"
          >
            <div className="hidden sm:visible sm:flex sm:flex-col sm:items-end ">
              <span className="text-base font-bold">{points}</span>
              <span className="text-xs font-medium text-muted-foreground text-right">
                {status}
              </span>
            </div>
            <Avatar size="lg">
              <AvatarImage src={`/${status}.png`} />
              <AvatarFallback>{status}</AvatarFallback>
            </Avatar>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

export default NavigationBar;
