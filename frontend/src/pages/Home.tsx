import NavigationBar from '@/components/NavigationBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Home() {
  return (
    <>
      <NavigationBar />
      <div className="container mx-auto px-8 flex flex-col gap-4 sm:gap-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Выберите сценарий</h1>
        <p className="text-md sm:text-lg md:w-3/4 lg:w-1/2">
          Пройдите переписку от лица продавца или покупателя. Зона риска заранее
          не раскрывается — будьте внимательны в моменте.
        </p>
      </div>
      <div className="container mx-auto px-8">
        <Tabs defaultValue="seller">
          <TabsList className="w-full flex items-center bg-muted border-2 border-border mb-8">
            <TabsTrigger className="cursor-pointer" value="seller">
              Продавец
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="buery">
              Покупатель
            </TabsTrigger>
          </TabsList>
          <TabsContent value="seller">Сценарии для "Продавец"</TabsContent>
          <TabsContent value="buery">Сценарии для "Покупатель"</TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default Home;
