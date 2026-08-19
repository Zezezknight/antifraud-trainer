import Scenarios from '@/components/Scenarios/Scenarios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { scenariosQuery } from '@/queries/scenarios';
import { useSuspenseQueries } from '@tanstack/react-query';

function Home() {
  const [{ data: buyerScenarios }, { data: sellerScenarios }] =
    useSuspenseQueries({
      queries: [
        scenariosQuery<'buyer'>('buyer'),
        scenariosQuery<'seller'>('seller'),
      ],
    });

  return (
    <>
      <div className="container-box flex flex-col gap-4 sm:gap-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Выберите сценарий</h1>
        <p className="text-md sm:text-lg md:w-3/4 lg:w-1/2">
          Пройдите переписку от лица продавца или покупателя. Зона риска заранее
          не раскрывается — будьте внимательны в моменте.
        </p>
      </div>
      <div className="container-box pb-12">
        <Tabs defaultValue="seller">
          <TabsList className="w-full flex items-center bg-muted border-2 border-border mb-8">
            <TabsTrigger className="cursor-pointer" value="seller">
              Продавец
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="buery">
              Покупатель
            </TabsTrigger>
          </TabsList>
          <TabsContent className="flex flex-col gap-8" value="seller">
            {sellerScenarios.length ? (
              <Scenarios scenarios={sellerScenarios} />
            ) : (
              'Сценариев для продавца нет.'
            )}
          </TabsContent>
          <TabsContent className="flex flex-col gap-8" value="buery">
            {buyerScenarios.length ? (
              <Scenarios scenarios={buyerScenarios} />
            ) : (
              'Сценариев для покупателя нет.'
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default Home;
