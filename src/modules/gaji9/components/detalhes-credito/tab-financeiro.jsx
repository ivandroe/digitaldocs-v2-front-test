// components
import CardsGrid from './cards-grid';
import { useTabFinanceiroData } from './useTabFinanceiroData';

// ---------------------------------------------------------------------------------------------------------------------

export function TabFinanceiro({ credito }) {
  const cards = useTabFinanceiroData(credito);
  return <CardsGrid cards={cards} />;
}
