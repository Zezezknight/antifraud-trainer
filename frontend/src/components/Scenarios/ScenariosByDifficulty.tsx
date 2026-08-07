import type { Difficulty, Scenario } from '@/types/scenarios';
import ScenarioCard from './ScenarioCard';

interface ScenariosProps {
  difficulty: Difficulty;
  scenarios: Scenario[];
}

function ScenariosByDifficulty({ difficulty, scenarios }: ScenariosProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="uppercase text-base text-muted-foreground font-semibold flex gap-2">
        <span className="inline-block w-1 bg-primary rounded-full"></span>
        <span>{difficulty === 'easy' ? 'Лёгкий' : 'Сложный'} уровень</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {scenarios.map(scenario => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}

export default ScenariosByDifficulty;
