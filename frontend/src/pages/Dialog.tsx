import { Link, useParams } from 'react-router';
import { ChevronLeft, CircleQuestionMark, Ellipsis, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import {
  type DialogHistory,
  type DialogNode,
  type DialogOption,
} from '@/types/dialog';
import DialogMessage from '@/components/Dialog/DialogMessage';
import DialogResults from '@/components/Dialog/DialogResults';
import { shuffleArray } from '@/utils/sorting';
import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import {
  dialogStartQuery,
  useDialogStepMutation,
  useSendDialogResultsMutation,
} from '@/queries/dialog';
import { scenarioQuery, scenariosQuery } from '@/queries/scenarios';
import DataRefetchContainer from '@/components/DataRefetchContainer';
import { profileQuery } from '@/queries/profile';
import DialogResultsSkeleton from '@/components/skeletons/DialogResultsSkeleton';

const LOADING_MS = 2000;

function Dialog() {
  const queryClient = useQueryClient();

  const dialogStepMutation = useDialogStepMutation();
  const sendDialogResultsMutation = useSendDialogResultsMutation();

  const { scenarioId: scenarioIdRow } = useParams();
  const scenarioId = Number(scenarioIdRow);

  const [
    { data: dialogStart },
    {
      data: scenario,
      isFetching: scenarioIsFetching,
      isError: scenarioIsError,
      refetch: scenarioRefetch,
    },
  ] = useSuspenseQueries({
    queries: [dialogStartQuery(scenarioId), scenarioQuery(scenarioId)],
  });

  const [currentOptions, setCurrentOptions] = useState<DialogOption[]>(
    dialogStart.options,
  );
  const [dialogHistory, setDialogHistory] = useState<DialogHistory[]>([
    {
      ...dialogStart.scenarioNode,
      type: 'opponent',
    },
  ]);

  const [isOpponentTyping, setIsOpponentTyping] = useState(true);
  const [failedOption, setFailedOption] = useState<DialogOption | null>(null);
  const [modalResultsShown, setModalResultsShown] = useState(false);
  const [showDialogDescription, setShowDialogDescription] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Скролл к последнему сообщению в диалоге
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [dialogHistory, isOpponentTyping]);

  // Стартовая анимация набора сообщения оппонента
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOpponentTyping(false);
    }, LOADING_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  async function handleDialogFinish(finalStatus: DialogNode['finalStatus']) {
    if (finalStatus != '') {
      try {
        // Отображаем модальное окно результата
        setModalResultsShown(true);

        await sendDialogResultsMutation.mutateAsync({
          scenarioId: scenario.id,
          status: finalStatus,
        });

        // Инвалидация сценариев и профиля
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: scenariosQuery('buyer').queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: scenariosQuery('seller').queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: profileQuery().queryKey,
          }),
        ]);
      } catch (error) {
        console.log(
          `Ошибка при отправке результатов сценария с ID=${scenario.id}`,
          error,
        );
      }
    }
  }

  async function handleOptionChoise(option: DialogOption, isRetry = false) {
    // Если оппонент "печатает", полностью игнорируем клики
    if (isOpponentTyping) return;
    setIsOpponentTyping(true);

    const isOptionExists = currentOptions.some(opt => opt.id === option.id);
    if (!isOptionExists) {
      setIsOpponentTyping(false);
      return;
    }

    if (!isRetry) {
      setDialogHistory(hist => [
        ...hist,
        {
          ...option,
          type: 'user',
        },
      ]);
    }

    try {
      const nextDialogStep = await dialogStepMutation.mutateAsync({
        scenarioId: scenario.id,
        optionId: option.id,
      });

      setFailedOption(null);
      setCurrentOptions(nextDialogStep.options);
      setDialogHistory(hist => [
        ...hist,
        {
          ...nextDialogStep.scenarioNode,
          type: 'opponent',
        },
      ]);

      if (!nextDialogStep.scenarioNode.isFinal) {
        setTimeout(() => setIsOpponentTyping(false), LOADING_MS);
      } else {
        setIsOpponentTyping(false);
        void handleDialogFinish(nextDialogStep.scenarioNode.finalStatus);
      }
    } catch (error) {
      setFailedOption(option);
      setIsOpponentTyping(false);
      console.log(`Ошибка при выборе опции c ID=${option.id}`, error);
    }
  }

  return (
    <>
      {modalResultsShown &&
        (sendDialogResultsMutation.isPending ? (
          <DialogResultsSkeleton />
        ) : (
          <DialogResults scenario={scenario} history={dialogHistory} />
        ))}
      <div className="h-screen flex flex-col gap-4">
        <div className="relative shadow-sm">
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
                  {scenario.role === 'buyer' ? 'Продавец' : 'Покупатель'}
                </span>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {scenario.title}
                </span>
              </div>
            </div>
          </div>
          {showDialogDescription ? (
            <div className="bg-primary-foreground py-1">
              <div className="container-box flex items-center justify-center gap-2 relative text-[#090b0c]">
                <CircleQuestionMark className="shrink-0 size-4 text-primary" />
                <span className="text-xs font-medium pr-3 sm:pr-0">
                  {scenario.description}
                </span>

                <X
                  className="p-1 size-6 absolute -top-1 right-0 cursor-pointer"
                  onClick={() => setShowDialogDescription(false)}
                />
              </div>
            </div>
          ) : null}

          <DataRefetchContainer
            offset={8}
            isFetching={scenarioIsFetching}
            isError={scenarioIsError}
            refetch={() => void scenarioRefetch()}
          />
        </div>

        <div
          ref={scrollContainerRef}
          className="container-box flex-1 overflow-y-auto flex flex-col gap-8 py-2 sm:py-6
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
            const isOpponent = dialogItem.type === 'opponent';
            const isTyping = isLastMessage && isOpponent && isOpponentTyping;

            if (isOpponent && dialogItem.isFinal) return null;

            return dialogItem.type === 'opponent' ? (
              <DialogMessage
                key={`${dialogItem.type}${dialogItem.id}`}
                typing={isTyping}
                type="opponent"
                text={dialogItem.messageText}
              />
            ) : (
              <DialogMessage
                key={`${dialogItem.type}${dialogItem.id}`}
                typing={isTyping}
                type="user"
                text={dialogItem.messageText}
                status={isLastMessage ? dialogStepMutation.status : 'success'}
              />
            );
          })}
        </div>

        {dialogStepMutation.isError && (
          <div className="flex items-center justify-center gap-1 text-destructive">
            <span>Ошибка при отправке сообщения.</span>
            <button
              className="underline cursor-pointer"
              onClick={() => {
                if (failedOption) {
                  void handleOptionChoise(failedOption, true);
                }
              }}
            >
              Повторить
            </button>
          </div>
        )}

        <div className="bg-background pt-2 sm:pt-4 pb-4 sm:pb-8">
          <div className="container-box flex flex-col gap-2 sm:gap-4 items-center">
            <span className="text-sm font-medium">
              {currentOptions.length ? 'Как вы поступите?' : 'Выбор завершён.'}
            </span>
            {currentOptions.length ? (
              <div className="text-xs sm:text-sm font-medium flex flex-col gap-2 w-full">
                {shuffleArray(currentOptions).map(option => (
                  <div
                    key={option.id}
                    className={`transition-colors bg-muted border-border ${isOpponentTyping ? 'flex items-center justify-center text-muted-foreground' : 'hover:bg-primary-subtle hover:border-primary cursor-pointer'} border rounded-lg px-4 py-3`}
                    onClick={() => {
                      if (!failedOption) void handleOptionChoise(option);
                    }}
                  >
                    {isOpponentTyping ? (
                      <Ellipsis
                        className="size-4 opacity-70
                          [&_circle]:animate-pulse 
                          [&_circle:nth-child(1)]:[animation-delay:0ms] 
                          [&_circle:nth-child(2)]:[animation-delay:200ms] 
                          [&_circle:nth-child(3)]:[animation-delay:400ms]"
                      />
                    ) : (
                      option.messageText
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dialog;
