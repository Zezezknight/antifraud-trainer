import logoDark from '@/assets/avito-antifraud-logo.svg';
import logoLight from '@/assets/avito-antifraud-logo-dark.svg';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from './ThemeProvider';
import { ModeToggle } from './ModeToggle';
import { useSuspenseQuery } from '@tanstack/react-query';
import { profileQuery } from '@/queries/profile';

function NavigationBar() {
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
          <ProfileBadge />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

function ProfileBadge() {
  const { data: profile } = useSuspenseQuery(profileQuery());

  return (
    <Link
      to="/profile"
      className="inline-flex items-center gap-2 sm:px-3 sm:py-1.5 rounded-2xl border-2 border-border bg-background"
    >
      <div className="hidden sm:visible sm:flex sm:flex-col sm:items-end ">
        <span className="text-base font-bold">{profile.points}</span>
        <span className="text-xs font-medium text-muted-foreground text-right">
          {profile.status}
        </span>
      </div>
      <Avatar size="lg">
        <AvatarImage src={`/${profile.status}.png`} />
        <AvatarFallback>{profile.status}</AvatarFallback>
      </Avatar>
    </Link>
  );
}

export default NavigationBar;
