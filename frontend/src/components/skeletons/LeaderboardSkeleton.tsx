import { Skeleton } from '../ui/skeleton';

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center border-none rounded-2xl h-12">
        <div className="w-[20%] sm:w-[15%] pl-2 flex items-center">Место</div>
        <div className="w-[50%] sm:w-[55%] flex items-center">Пользователь</div>
        <div className="w-[30%] flex items-center justify-end">Очки</div>
      </div>
      <Skeleton className="w-full h-12 rounded-2xl bg-muted" />
      <Skeleton className="w-full h-12 rounded-2xl bg-muted" />
      <Skeleton className="w-full h-12 rounded-2xl bg-muted" />
      <div className="w-full text-xl font-bold text-muted-foreground text-center">
        ...
      </div>
      <Skeleton className="w-full h-12 rounded-2xl bg-muted" />
    </div>
  );
}

export default LeaderboardSkeleton;
