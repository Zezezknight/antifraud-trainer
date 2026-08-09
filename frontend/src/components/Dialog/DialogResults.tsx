import {
  FINAL_SCORE,
  type DialogHistory,
  type DialogNodeWithType,
  type DialogOptionWithType,
} from '@/types/dialog';
import IconInCircle from '../IconInCircle';
import { ShieldCheck, Eye, Lightbulb, RefreshCcw, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router';
import type { Scenario } from '@/types/scenarios';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';

interface DialogResultsProps {
  history: DialogHistory[];
  scenario: Scenario;
}

function DialogResults({ history, scenario }: DialogResultsProps) {
  const navigate = useNavigate();
  const finalNode = history.at(-1) as DialogNodeWithType;
  const userOptions = history.filter(answer => answer.type === 'user');
  const dialogNodes: {
    opt: DialogOptionWithType;
    node: DialogNodeWithType;
  }[] = [];

  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  for (const opt of userOptions) {
    const node = history.find(
      (n): n is DialogNodeWithType =>
        n.type === 'opponent' && n.id === opt.fromNodeId,
    );
    if (node) {
      dialogNodes.push({
        opt,
        node,
      });
    }
  }

  const handleRetry = () => {
    void navigate(`/scenarios/${scenario.id}?retry=${Date.now()}`);
  };

  let bgColor = '';
  let textColor = '';
  let bgColorTransparent = '';
  let titleText = '';
  let subtitleText = '';

  switch (finalNode.finalStatus) {
    case 'green':
      titleText = 'Вы в безопасности!';
      subtitleText = 'Сделка завершена без рисков.';
      bgColor = 'bg-success';
      textColor = 'text-success';
      bgColorTransparent = 'bg-success/20';
      break;
    case 'yellow':
      titleText = 'Вы вовремя остановились!';
      subtitleText = 'Мошенник почти добился своего.';
      bgColor = 'bg-warning';
      textColor = 'text-warning';
      bgColorTransparent = 'bg-warning/20';
      break;
    case 'red':
      titleText = 'Фатальная потеря!';
      subtitleText = 'Вы потеряли деньги или данные.';
      bgColor = 'bg-destructive';
      textColor = 'text-destructive';
      bgColorTransparent = 'bg-destructive/20';
      break;

    default:
      break;
  }

  return (
    <div className="absolute inset-0 z-10 bg-foreground/20 backdrop-blur-md flex items-center justify-center">
      <div className="container-box flex items-center justify-center">
        <div
          className="bg-background rounded-lg shadow-sm w-full max-w-175 max-h-[90vh] overflow-hidden overflow-y-auto pb-6 flex flex-col gap-6 scrollbar-thin 
            [scrollbar-color:rgba(0,0,0,0.15)_transparent] 
            [&::-webkit-scrollbar]:w-1.5 
            [&::-webkit-scrollbar-track]:bg-muted-foreground 
            [&::-webkit-scrollbar-thumb]:bg-foreground/15 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            [&::-webkit-scrollbar-button]:hidden"
        >
          <div
            className={`flex flex-col items-center gap-4 ${bgColorTransparent} px-6 sm:px-8 py-6`}
          >
            <div className="flex flex-col items-center sm:flex-row gap-4">
              <IconInCircle
                backgroundColor={bgColor}
                icon={<ShieldCheck className="text-background size-8" />}
                variants="lg"
              />
              <div className="flex flex-col gap-1 items-center">
                <h2 className={`text-2xl font-bold ${textColor}`}>
                  {titleText}
                </h2>
                <span className="text-sm">{subtitleText}</span>
              </div>
            </div>

            <div className="text-sm font-bold bg-background rounded-lg border border-border px-2 py-1">
              {finalNode.finalStatus && FINAL_SCORE[finalNode.finalStatus]} из
              100 <span className="text-xs font-medium">очков</span>
            </div>

            <p className="text-xs text-muted-foreground text-center max-w-3/4">
              {finalNode.messageText}
            </p>
          </div>

          <div className="px-6 sm:px-8">
            <div className="flex flex-col gap-4 pb-6 border-b-2 border-b-border">
              <h3 className="text-base font-semibold">Разбор диалога</h3>
              <Carousel setApi={setApi}>
                <CarouselContent>
                  {dialogNodes.map(d => {
                    let optBgColor = '';
                    let optBorderColor = '';

                    switch (d.opt.status) {
                      case 'green':
                        optBgColor = 'bg-success/20';
                        optBorderColor = 'border-success';
                        break;
                      case 'yellow':
                        optBgColor = 'bg-warning/20';
                        optBorderColor = 'border-warning';
                        break;
                      case 'red':
                        optBgColor = 'bg-destructive/20';
                        optBorderColor = 'border-destructive';
                        break;

                      default:
                        break;
                    }

                    return (
                      <CarouselItem className="px-8 sm:px-12" key={d.node.id}>
                        <div className="bg-background rounded-lg shadow-sm border border-border flex flex-col gap-4 p-4">
                          <h4 className="uppercase text-base font-semibold text-muted-foreground">
                            Шаг {currentSlide + 1}
                          </h4>

                          <div className="flex justify-start">
                            <div className="max-w-3/4 bg-muted rounded-lg border border-border px-4 py-3 text-sm font-medium">
                              {d.node.messageText}
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <div
                              className={`max-w-3/4 rounded-lg border px-4 py-3 text-sm font-medium ${optBgColor} ${optBorderColor}`}
                            >
                              {d.opt.messageText}
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="-left-4 sm:-left-2 cursor-pointer" />
                <CarouselNext className="-right-4 sm:-right-2 cursor-pointer" />
              </Carousel>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 sm:px-8">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Eye className="text-primary" />
              <span>Что на самом деле происходило</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {dialogNodes[currentSlide].opt.feedbackText}
            </p>
          </div>

          <div className="flex flex-col gap-3 px-6 sm:px-8">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="text-primary" />
              <span>Как распознать в жизни</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {dialogNodes[currentSlide].opt.howToRecognizeInLife}
            </p>
          </div>

          <div className="flex items-center gap-3 px-6 sm:px-8">
            <Button
              className="flex-1 cursor-pointer"
              variant="outline"
              onClick={handleRetry}
            >
              <RefreshCcw /> Повторить
            </Button>
            <Link className="flex-1" to="/">
              <Button className="w-full cursor-pointer" variant="default">
                <List /> К сценариям
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DialogResults;
