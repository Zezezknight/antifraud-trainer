import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from './ui/spinner';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
interface DataRefetchIndicatorFetching {
  isError: false;
}
interface DataRefetchIndicatorError {
  isError: true;
  message?: string;
  onRetry: () => void;
}

type DataRefetchIndicatorProps =
  | DataRefetchIndicatorFetching
  | DataRefetchIndicatorError;

function DataRefetchIndicator(props: DataRefetchIndicatorProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="bg-background! size-8 rounded-full cursor-pointer"
          >
            {props.isError ? (
              <X className="size-6 text-destructive" />
            ) : (
              <Spinner className="size-6 text-primary" />
            )}
          </Button>
        }
      />
      <PopoverContent
        className={cn(
          'w-fit px-3 py-2 shadow-none ring-0 border-none rounded-md',
          props.isError
            ? 'bg-destructive-subtle text-destructive'
            : 'bg-primary-subtle text-primary',
        )}
        align="center"
      >
        <PopoverHeader
          className={cn('flex flex-col items-center gap-1.5 text-sm')}
        >
          <PopoverTitle>
            {props.isError
              ? (props.message ?? 'Ошибка загрузки.')
              : 'Обновление...'}
          </PopoverTitle>
          {props.isError && (
            <PopoverDescription>
              <Button
                variant="destructive"
                onClick={props.onRetry}
                className="text-xs font-medium cursor-pointer bg-destructive! hover:bg-destructive/60! text-white rounded-md"
              >
                Повторить
              </Button>
            </PopoverDescription>
          )}
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

export default DataRefetchIndicator;
