import type { DialogMessageType } from '@/types/dialog';
import type { MutationStatus } from '@tanstack/react-query';
import { Ellipsis, Clock, CheckCheck, X, type LucideIcon } from 'lucide-react';

interface DialogMessagePropsBase {
  type: DialogMessageType;
  text: string;
  typing?: boolean;
}

interface DialogMessagePropsUser extends DialogMessagePropsBase {
  type: 'user';
  status: MutationStatus;
}

interface DialogMessagePropsOpponent extends DialogMessagePropsBase {
  type: 'opponent';
}

type DialogMessageProps = DialogMessagePropsUser | DialogMessagePropsOpponent;

function DialogMessage(props: DialogMessageProps) {
  const { type, text, typing = false } = props;
  const isOpponent = type === 'opponent';
  let MessageStateIcon: LucideIcon | null = null;

  if (!isOpponent) {
    switch (props.status) {
      case 'idle':
        MessageStateIcon = null;
        break;
      case 'pending':
        MessageStateIcon = Clock;
        break;
      case 'error':
        MessageStateIcon = X;
        break;
      case 'success':
        MessageStateIcon = CheckCheck;
        break;

      default: {
        const _exhaustiveCheck: never = props.status;
        return _exhaustiveCheck;
      }
    }
  }

  return (
    <div
      className={`flex flex-col gap-2 ${isOpponent ? 'items-start' : 'items-end'}`}
    >
      <span
        className={`relative text-sm sm:text-base max-w-3/4 sm:max-w-2/3 md:max-w-1/2 inline-block rounded-lg border px-4 py-3 ${isOpponent ? 'bg-background  border-border' : 'bg-primary-subtle border-primary'}`}
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
        {MessageStateIcon && (
          <MessageStateIcon className="size-4 absolute right-2 bottom-2 text-primary" />
        )}
      </span>
    </div>
  );
}

export default DialogMessage;
