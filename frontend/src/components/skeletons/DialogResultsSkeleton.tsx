import { Eye, Lightbulb } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

function DialogResultsSkeleton() {
  return (
    <div className="absolute inset-0 z-10 bg-foreground/20 backdrop-blur-md flex items-center justify-center">
      <div className="container-box flex items-center justify-center">
        <div
          className="bg-background rounded-lg shadow-sm w-full max-w-175 max-h-[80vh] sm:max-h-[90vh] overflow-hidden overflow-y-auto pb-6 flex flex-col gap-6 scrollbar-thin 
            [scrollbar-color:rgba(0,0,0,0.15)_transparent] 
            [&::-webkit-scrollbar]:w-1.5 
            [&::-webkit-scrollbar-track]:bg-muted-foreground 
            [&::-webkit-scrollbar-thumb]:bg-foreground/15 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            [&::-webkit-scrollbar-button]:hidden"
        >
          <div className="flex flex-col items-center gap-4 bg-muted px-6 sm:px-8 py-6">
            <div className="flex flex-col items-center sm:flex-row gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex flex-col gap-1 items-center">
                <Skeleton className="w-60 h-8" />
                <Skeleton className="w-50 h-8" />
              </div>
            </div>

            <Skeleton className="w-32 h-7" />

            <Skeleton className="w-3/4 h-8" />
          </div>

          <div className="px-6 sm:px-8">
            <div className="flex flex-col gap-4 pb-6 border-b-2 border-b-border">
              <h3 className="text-base font-semibold">Разбор диалога</h3>
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 rounded-full bg-muted" />
                <Skeleton className="flex-1 h-70 bg-muted" />
                <Skeleton className="size-7 rounded-full bg-muted" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 sm:px-8">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Eye className="text-primary" />
              <span>Что на самом деле происходило</span>
            </h3>
            <Skeleton className="w-full h-5 bg-muted" />
          </div>

          <div className="flex flex-col gap-3 px-6 sm:px-8">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="text-primary" />
              <span>Как распознать в жизни</span>
            </h3>
            <Skeleton className="w-full h-5 bg-muted" />
          </div>

          <div className="flex items-center gap-3 px-6 sm:px-8">
            <Skeleton className="flex-1 h-8 bg-muted" />
            <Skeleton className="flex-1 h-8 bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DialogResultsSkeleton;
