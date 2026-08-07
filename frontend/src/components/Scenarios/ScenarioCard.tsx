import type { Scenario } from '@/types/scenarios';
import { Phone, CircleStar, ArrowRight } from 'lucide-react';
import IconInCircle from '../IconInCircle';
import { Button } from '../ui/button';
import { Link } from 'react-router';

interface ScenarioCardProps {
  scenario: Scenario;
}

function ScenarioCard({ scenario }: ScenarioCardProps) {
  let scenarioColor = '';
  const score = scenario.bestScore;

  if (score !== null) {
    if (score < 50) scenarioColor = 'text-destructive';
    else if (score < 75) scenarioColor = 'text-warning';
    else scenarioColor = 'text-success';
  }

  return (
    <div className="flex flex-col gap-4 pt-6 rounded-lg border-border border-2 bg-background overflow-hidden">
      <div className="flex items-start justify-between px-4">
        <IconInCircle
          icon={<Phone className="text-primary" />}
          variants="lg"
          backgroundColor="bg-primary/20"
        />
        <span className="inline-block rounded-lg border-border border-2 bg-background text-sm font-medium px-2.5 py-0.5">
          {scenario.difficulty === 'easy' ? 'Лёгкий' : 'Сложный'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4">
        <span className="text-base font-bold">{scenario.title}</span>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
      </div>
      <div className="p-4 bg-muted flex items-center justify-between">
        {score === null ? (
          <span className="text-sm text-muted-foreground">Не пройден</span>
        ) : (
          <span
            className={`${scenarioColor} text-base font-medium flex items-center gap-2`}
          >
            <CircleStar /> {score}/100
          </span>
        )}
        <Link to={`/scenarios/${scenario.id}`}>
          <Button
            className="cursor-pointer"
            variant={score === null ? 'outline' : 'default'}
          >
            {score === null ? 'Перепройти' : 'Начать'} <ArrowRight />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ScenarioCard;
