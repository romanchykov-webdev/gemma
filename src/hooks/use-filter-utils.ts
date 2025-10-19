import { Filters } from '@/hooks/use-filters';
import qs from 'qs';
import * as React from 'react';

export type HistoryMode = 'push' | 'replace';

// 1) Дебаунс любого значения
function useDebouncedValue<T>(value: T, delay = 500): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// 2) Скип первого рендера (возвращает функцию-предикат)
function useSkipFirstRender() {
  const first = React.useRef(true);
  return () => {
    if (first.current) {
      first.current = false;
      return true;
    }
    return false;
  };
}

// 3) Сравнение Set по содержимому
function setEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every(x => b.has(x));
}

// // 4) Сериализация фильтров в query (?a=1&b=2&sizes=20,30)
// function serializeFiltersToQuery(params: {
// 	priceFrom: number;
// 	priceTo: number;
// 	pizzaTypes: number[];
// 	sizes: number[];
// 	ingredients: number[];
// }) {
// 	return qs.stringify(params, { arrayFormat: "comma", skipNulls: true, addQueryPrefix: true });
// }
// 4) Сериализация фильтров в query (?a=1&b=2&sizes=20,30)
function serializeFiltersToQuery(params: {
  priceFrom?: number;
  priceTo?: number;
  pizzaTypes: number[];
  sizes: number[];
  ingredients: number[];
}) {
  // Создаем копию параметров для модификации
  const filteredParams = { ...params };

  // Удаляем параметры цены, если они равны 0 или undefined
  if (filteredParams.priceFrom === 0 || filteredParams.priceFrom === undefined) {
    delete filteredParams.priceFrom;
  }

  if (filteredParams.priceTo === 0 || filteredParams.priceTo === undefined) {
    delete filteredParams.priceTo;
  }

  // Добавляем массивы только если они не пустые
  if (params.pizzaTypes && params.pizzaTypes.length > 0) {
    filteredParams.pizzaTypes = params.pizzaTypes;
  }

  if (params.sizes && params.sizes.length > 0) {
    filteredParams.sizes = params.sizes;
  }

  if (params.ingredients && params.ingredients.length > 0) {
    filteredParams.ingredients = params.ingredients;
  }

  return qs.stringify(filteredParams, {
    arrayFormat: 'comma',
    skipNulls: true,
    addQueryPrefix: true,
  });
}

// 5) Правило выбора push/replace
function pickHistoryMode(next: Filters, prev: Filters): HistoryMode {
  const sizesChanged = !setEqual(next.sizes, prev.sizes);
  const typesChanged = !setEqual(next.pizzaTypes, prev.pizzaTypes);
  const ingrChanged = !setEqual(next.selectedIngredients, prev.selectedIngredients);
  const priceChanged =
    next.prices.priceFrom !== prev.prices.priceFrom || next.prices.priceTo !== prev.prices.priceTo;

  if (sizesChanged || typesChanged || ingrChanged) return 'push';
  if (priceChanged) return 'replace';
  return 'replace';
}

// 6) Супер-хук: отдаём всё разом
export function useFilterUtils() {
  return {
    useDebouncedValue,
    useSkipFirstRender,
    setEqual,
    serializeFiltersToQuery,
    pickHistoryMode,
  };
}
