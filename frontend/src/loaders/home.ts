import { getScenarios } from '@/service/scenarios';
import { useScenariosStore } from '@/store/scenarios';
import type { Scenario } from '@/types/scenarios';

export interface HomeLoader {
  seller: Scenario<'seller'>[];
  buyer: Scenario<'buyer'>[];
}

export async function homeLoader() {
  try {
    const { scenarios, setScenarios } = useScenariosStore.getState();

    const buyerPromise =
      scenarios.buyer.length === 0
        ? getScenarios<'buyer'>('buyer').then(scenarios => {
            setScenarios('buyer', scenarios);
            return scenarios;
          })
        : Promise.resolve(scenarios.buyer);

    const sellerPromise =
      scenarios.seller.length === 0
        ? getScenarios<'seller'>('seller').then(scenarios => {
            setScenarios('seller', scenarios);
            return scenarios;
          })
        : Promise.resolve(scenarios.seller);

    const [buyer, seller] = await Promise.all([buyerPromise, sellerPromise]);
    return { buyer, seller };
  } catch (error) {
    console.error(error);
    return {
      buyer: [],
      seller: [],
    };
  }
}
