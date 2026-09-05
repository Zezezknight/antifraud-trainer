import { Link } from 'react-router';
import { Skeleton } from '../ui/skeleton';

function ProfileBadgeSkeleton() {
  return (
    <Link
      to="/profile"
      className="inline-flex items-center gap-2 sm:px-3 sm:py-1.5 rounded-2xl border-2 border-border bg-background"
    >
      <div className="hidden sm:visible sm:flex sm:flex-col sm:items-end gap-2">
        <Skeleton className="w-8 h-4 bg-muted" />
        <Skeleton className="w-16 h-3 bg-muted" />
      </div>
      <Skeleton className="size-10 rounded-full bg-muted" />
    </Link>
  );
}

export default ProfileBadgeSkeleton;
