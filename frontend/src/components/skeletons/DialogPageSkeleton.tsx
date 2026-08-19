import { Link } from 'react-router';
import { Skeleton } from '../ui/skeleton';
import { ChevronLeft } from 'lucide-react';

function DialogPageSkeleton() {
  return (
    <>
      <div className="h-screen flex flex-col gap-4">
        <div>
          <div className="bg-background py-4">
            <div className="container-box flex items-center gap-4">
              <Link to="/">
                <ChevronLeft className="size-6 sm:size-8" />
              </Link>
              <Skeleton className="size-12 rounded-full bg-muted" />
              <div className="flex flex-col gap-2">
                <Skeleton className="w-30 sm:w-40 h-4 bg-muted" />
                <Skeleton className="w-50 sm:w-90 h-3 bg-muted" />
              </div>
            </div>
          </div>
          <div className="bg-primary-foreground py-1">
            <div className="container-box flex items-center justify-center">
              <Skeleton className="w-full h-8 bg-muted" />
            </div>
          </div>
        </div>
        <div className="container-box flex flex-1 flex-col gap-8 py-2 sm:py-6">
          <div className="flex flex-col gap-2 items-start">
            <Skeleton className="w-16 h-12" />
          </div>
        </div>
        <div className="bg-background pt-2 sm:pt-4 pb-4 sm:pb-8">
          <div className="container-box flex flex-col gap-2 sm:gap-4 items-center">
            <Skeleton className="w-32 h-5 bg-muted" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="w-full h-12 bg-muted" />
              <Skeleton className="w-full h-12 bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DialogPageSkeleton;
