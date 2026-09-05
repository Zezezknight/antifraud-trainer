import { Skeleton } from '../ui/skeleton';

function ProfilePageSkeleton() {
  return (
    <>
      <div className="container-box flex flex-col gap-4 sm:gap-8 pb-12">
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-164" />
        <Skeleton className="w-full h-55" />
        <div className="flex items-center justify-center">
          <Skeleton className="w-53 h-12" />
        </div>
      </div>
    </>
  );
}

export default ProfilePageSkeleton;
