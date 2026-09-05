import DataRefetchContainer from '@/components/DataRefetchContainer';
import Scenarios from '@/components/Scenarios/Scenarios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { scenariosQuery } from '@/queries/scenarios';
import type { Role, Scenario } from '@/types/scenarios';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

function Home() {
  const [
    {
      data: buyer,
      isFetching: buyerIsFetching,
      isError: buyerIsError,
      refetch: buyerRefetch,
    },
    {
      data: seller,
      isFetching: sellerIsFetching,
      isError: sellerIsError,
      refetch: sellerRefetch,
    },
  ] = useSuspenseQueries({
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
            <TabsTrigger className="cursor-pointer" value="buyer">
              Покупатель
            </TabsTrigger>
          </TabsList>
          <ScenariosTabContent
            role="seller"
            scenarios={seller}
            isFetching={sellerIsFetching}
            isError={sellerIsError}
            refetch={sellerRefetch}
          />
          <ScenariosTabContent
            role="buyer"
            scenarios={buyer}
            isFetching={buyerIsFetching}
            isError={buyerIsError}
            refetch={buyerRefetch}
          />
        </Tabs>
      </div>
    </>
  );
}

export default Home;

interface ScenariosTabProps<T extends Role> {
  role: Role;
  scenarios: Scenario<T>[];
  isFetching: boolean;
  isError: boolean;
  refetch: ReturnType<typeof useSuspenseQuery>['refetch'];
}

function ScenariosTabContent<T extends Role>({
  role,
  scenarios,
  isFetching,
  isError,
  refetch,
}: ScenariosTabProps<T>) {
  return (
    <TabsContent className="flex flex-col gap-8 relative" value={role}>
      {scenarios.length ? (
        <Scenarios scenarios={scenarios} />
      ) : (
        'Сценариев нет.'
      )}
      <DataRefetchContainer
        isFetching={isFetching}
        isError={isError}
        refetch={() => void refetch()}
      />
    </TabsContent>
  );
}
