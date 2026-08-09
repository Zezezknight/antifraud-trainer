import type { DialogLoader } from '@/loaders/dialog';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { ChevronLeft, CircleQuestionMark } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  type DialogMessageType,
  type DialogNode,
  type DialogOption,
} from '@/types/dialog';
import DialogMessage from '@/components/Dialog/DialogMessage';
import { getDialogStep, sendDialogResults } from '@/service/dialog';

type DialogNodeWithType = DialogNode & {
  type: DialogMessageType;
};

type DialogOptionWithType = DialogOption & {
  type: DialogMessageType;
};

const LOADING_MS = 2000; // Вынесли константу

function Dialog() {
  const navigate = useNavigate();
  const { scenario, dialogStart } = useLoaderData<DialogLoader>();

  const [currentOptions, setCurrentOptions] = useState<DialogOption[]>(
    dialogStart.options,
  );
  const [dialogHistory, setDialogHistory] = useState<
    (DialogNodeWithType | DialogOptionWithType)[]
  >([
    {
      ...dialogStart.scenarioNode,
      type: 'opponent',
    },
  ]);
  const [isOpponentTyping, setIsOpponentTyping] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOpponentTyping(false);
    }, LOADING_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  async function handleOptionChoise(option: DialogOption) {
    // Если оппонент "печатает", полностью игнорируем клики
    if (isOpponentTyping) return;

    const isOptionExists = currentOptions.some(opt => opt.id === option.id);
    if (!isOptionExists) return;

    setDialogHistory(hist => [
      ...hist,
      {
        ...option,
        type: 'user',
      },
    ]);

    try {
      const nextDialogStep = await getDialogStep(scenario.id, option.id);

      setCurrentOptions(nextDialogStep.options);

      if (!nextDialogStep.scenarioNode.isFinal) {
        setIsOpponentTyping(true);

        setDialogHistory(hist => [
          ...hist,
          {
            ...nextDialogStep.scenarioNode,
            type: 'opponent',
          },
        ]);

        setTimeout(() => {
          setIsOpponentTyping(false);
        }, LOADING_MS);
      } else {
        const finalStatus = nextDialogStep.scenarioNode.finalStatus;

        if (finalStatus != '') {
          await sendDialogResults(scenario.id, finalStatus);
          // Отображать модальное окно результата
          void navigate('/');
        }
      }
    } catch (error) {
      console.log(`Ошибка при выборе опции c ID=${option.id}`, error);
    }
  }

  return (
    <div className="h-screen flex flex-col gap-6">
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

      <div
        className="container-box flex-1 overflow-y-auto flex flex-col gap-8 py-6
          scrollbar-thin 
          [scrollbar-color:rgba(0,0,0,0.15)_transparent] 
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-muted-foreground 
          [&::-webkit-scrollbar-thumb]:bg-foreground/15 
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-button]:hidden"
      >
        {dialogHistory.map((dialogItem, index) => {
          const isLastMessage = index === dialogHistory.length - 1;
          const isTyping =
            isLastMessage && dialogItem.type === 'opponent' && isOpponentTyping;

          return (
            <DialogMessage
              key={`${dialogItem.type}${dialogItem.id}`}
              typing={isTyping}
              type={dialogItem.type}
              text={dialogItem.messageText}
            />
          );
        })}
      </div>

      <div className="bg-background pt-4 pb-8">
        <div className="container-box flex flex-col gap-4 items-center">
          <span className="text-sm font-medium">
            {currentOptions.length ? 'Как вы поступите?' : 'Выбор завершён.'}
          </span>
          {currentOptions.length ? (
            <div className="flex flex-col gap-2 w-full">
              {currentOptions.map(option => (
                <div
                  key={option.id}
                  className={`transition-colors bg-muted border-border ${isOpponentTyping ? 'text-muted-foreground' : 'hover:bg-primary/20 hover:border-primary cursor-pointer'} border rounded-lg px-4 py-3 text-base font-medium`}
                  onClick={() => void handleOptionChoise(option)}
                >
                  {option.messageText}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Dialog;
