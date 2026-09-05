import logoDark from '@/assets/avito-antifraud-logo.svg';
import logoLight from '@/assets/avito-antifraud-logo-dark.svg';
import { Link } from 'react-router';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from './ThemeProvider';
import { ModeToggle } from './ModeToggle';
import {
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { profileQuery } from '@/queries/profile';
import { Suspense } from 'react';
import ProfileBadgeSkeleton from './skeletons/ProfileBadgeSkeleton';
import DataRefetchContainer from './DataRefetchContainer';
import { ErrorBoundary } from 'react-error-boundary';

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
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary }) => (
                  <div className="relative">
                    <ProfileBadgeSkeleton />
                    <DataRefetchContainer
                      isError
                      refetch={resetErrorBoundary}
                      isFetching={false}
                      offset={-8}
                    />
                  </div>
                )}
              >
                <Suspense fallback={<ProfileBadgeSkeleton />}>
                  <ProfileBadge />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>

          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

function ProfileBadge() {
  const {
    data: profile,
    isFetching,
    isError,
    refetch,
  } = useSuspenseQuery(profileQuery());

  return (
    <div className="relative">
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
        </Avatar>
      </Link>

      <DataRefetchContainer
        offset={-8}
        isFetching={isFetching}
        isError={isError}
        refetch={() => void refetch()}
      />
    </div>
  );
}

export default NavigationBar;
