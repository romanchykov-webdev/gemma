import { Filters } from '@/hooks/use-filters';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useFilterUtils } from './use-filter-utils';

export function useQueryFilters(filters: Filters) {
  const pathname = usePathname();

  // Вытаскиваем утилиты
  const { useDebouncedValue, serializeFiltersToQuery } = useFilterUtils();

  // ✅ Дебаунс ТОЛЬКО для URL (не влияет на UI фильтрацию!)
  const debouncedFilters = useDebouncedValue(filters, 300);

  useEffect(() => {
    // Генерируем query string
    const query = serializeFiltersToQuery({
      priceFrom: debouncedFilters.prices.priceFrom ?? 0,
      priceTo: debouncedFilters.prices.priceTo ?? 0,
      pizzaTypes: Array.from(debouncedFilters.pizzaTypes).map(Number),
      sizes: Array.from(debouncedFilters.sizes).map(Number),
      ingredients: Array.from(debouncedFilters.selectedIngredients).map(Number),
    });

    // ⚡ ТОЛЬКО обновление URL (без навигации и SSR!)
    if (typeof window !== 'undefined') {
      const newUrl = query ? `${pathname}${query}` : pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [debouncedFilters, pathname, serializeFiltersToQuery]);
}
