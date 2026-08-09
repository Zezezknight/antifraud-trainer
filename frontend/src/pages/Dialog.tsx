import type { DialogLoader } from '@/loaders/dialog';
import { Link, Navigate, useLoaderData } from 'react-router';
import { ChevronLeft, CircleQuestionMark } from 'lucide-react';

function Dialog() {
  const { scenario } = useLoaderData<DialogLoader>();

  if (!scenario.isAvailable) return <Navigate to="/" replace />;

  return (
    <>
      <div className="shadow-sm">
        <div className="bg-background py-4">
          <div className="container-box flex items-center gap-4">
            <Link to="/">
              <ChevronLeft className="size-6 sm:size-8" />
            </Link>

            <span className="text-lg sm:text-xl font-bold text-background bg-primary size-12 flex items-center justify-center rounded-full">
              П
            </span>

            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-semibold">
                {scenario.role === 'buyer' ? 'Покупатель' : 'Продавец'}
              </span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {scenario.title}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-primary-foreground py-1">
          <div className="container-box flex items-center justify-center gap-2">
            <CircleQuestionMark className="shrink-0 size-4 text-primary" />
            <span className="text-xs font-medium">{scenario.description}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dialog;
