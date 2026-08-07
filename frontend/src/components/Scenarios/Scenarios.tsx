import type { Role, Scenario } from '@/types/scenarios';
import { useMemo } from 'react';
import ScenariosByDifficulty from './ScenariosByDifficulty';

interface ScenariosProps<T extends Role> {
  scenarios: Scenario<T>[];
}

function Scenarios<T extends Role>({ scenarios }: ScenariosProps<T>) {
  const { scenariosEasy, scenariosHard } = useMemo(() => {
    const scenariosEasy: Scenario<T>[] = [];
    const scenariosHard: Scenario<T>[] = [];

    scenarios.forEach(scenario => {
      if (scenario.difficulty === 'easy') {
        scenariosEasy.push(scenario);
      } else {
        scenariosHard.push(scenario);
      }
    });

    return {
      scenariosEasy,
      scenariosHard,
    };
  }, [scenarios]);

  return (
    <>
      {scenariosEasy.length ? (
        <ScenariosByDifficulty difficulty="easy" scenarios={scenariosEasy} />
      ) : null}
      {scenariosHard.length ? (
        <ScenariosByDifficulty difficulty="hard" scenarios={scenariosHard} />
      ) : null}
    </>
  );
}

export default Scenarios;
