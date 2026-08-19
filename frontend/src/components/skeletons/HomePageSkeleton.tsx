import { Skeleton } from '../ui/skeleton';

function HomePageSkeleton() {
  return (
    <>
      <div className="container-box flex flex-col gap-4 sm:gap-8">
        <Skeleton className="w-1/4 h-10" />
        <Skeleton className="w-1/2 h-14" />
      </div>
      <div className="container-box pb-12">
        <Skeleton className="w-full h-8 mb-8" />
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <Skeleton className="w-40 h-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Skeleton className="w-full min-h-80" />
              <Skeleton className="w-full min-h-80" />
              <Skeleton className="w-full min-h-80" />
              <Skeleton className="w-full min-h-80" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="w-40 h-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Skeleton className="w-full min-h-80" />
              <Skeleton className="w-full min-h-80" />
              <Skeleton className="w-full min-h-80" />
              <Skeleton className="w-full min-h-80" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePageSkeleton;
