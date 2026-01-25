import { Filters } from '@/hooks/use-filters';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useFilterUtils } from './use-filter-utils';

export function useQueryFilters(filters: Filters) {
  const pathname = usePathname();
  const { serializeFiltersToQuery } = useFilterUtils();

  useEffect(() => {
    const query = serializeFiltersToQuery({
      priceFrom: filters.prices.priceFrom ?? 0,
      priceTo: filters.prices.priceTo ?? 0,
      pizzaTypes: Array.from(filters.pizzaTypes).map(Number),
      sizes: Array.from(filters.sizes).map(Number),
      ingredients: Array.from(filters.selectedIngredients).map(Number),
    });

    if (typeof window !== 'undefined') {
      const newUrl = query ? `${pathname}${query}` : pathname;
      const currentUrl = window.location.pathname + window.location.search;

      // Обновляем URL только если он действительно изменился
      if (currentUrl !== newUrl) {
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [filters, pathname, serializeFiltersToQuery]);
}
