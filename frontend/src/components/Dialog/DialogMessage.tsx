import type { DialogMessageType } from '@/types/dialog';
import { Ellipsis } from 'lucide-react';

interface DialogMessageProps {
  type: DialogMessageType;
  text: string;
  typing?: boolean;
}

function DialogMessage({ type, text, typing = false }: DialogMessageProps) {
  const isOpponent = type === 'opponent';

  return (
    <div
      className={`flex flex-col gap-2 ${isOpponent ? 'items-start' : 'items-end'}`}
    >
      <span
        className={`max-w-1/2 inline-block rounded-lg border px-4 py-3 ${isOpponent ? 'bg-background  border-border' : 'bg-primary/20 border-primary'}`}
      >
        {typing ? (
          <Ellipsis
            className="size-8 opacity-70
              [&_circle]:animate-pulse 
              [&_circle:nth-child(1)]:[animation-delay:0ms] 
              [&_circle:nth-child(2)]:[animation-delay:200ms] 
              [&_circle:nth-child(3)]:[animation-delay:400ms]"
          />
        ) : (
          text
        )}
      </span>
    </div>
  );
}

export default DialogMessage;
