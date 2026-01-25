import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from '@/constants/pizza';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface PriceProps {
  priceFrom?: number;
  priceTo?: number;
}

interface IQueryFilters extends PriceProps {
  pizzaTypes: string;
  sizes: string;
  ingredients: string;
}

export interface Filters {
  sizes: Set<string>;
  pizzaTypes: Set<string>;
  selectedIngredients: Set<string>;
  prices: PriceProps;
}

interface ReturnProps extends Filters {
  setPrices: (name: keyof PriceProps, value: number) => void;
  setPizzaTypes: (value: string) => void;
  setSizes: (value: string) => void;
  setSelectedIngredients: (value: string) => void;
  resetFilters: () => void;
  hasFilters: boolean;
}

export const useFilters = (): ReturnProps => {
  const searchParams = useSearchParams() as unknown as Map<keyof IQueryFilters, string>;

  /*Фильтр ингредиентов*/
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());

  /*Фильтр размеров*/
  const [sizes, setSizes] = useState<Set<string>>(new Set());

  /*Фильтр типа пиццы*/
  const [pizzaTypes, setPizzaTypes] = useState<Set<string>>(new Set());

  /*Фильтр цены*/
  const [prices, setPricesState] = useState<PriceProps>({});

  // 🔥 Синхронизируем фильтры с URL параметрами
  useEffect(() => {
    const ingredientsFromUrl = searchParams.has('ingredients')
      ? searchParams.get('ingredients')?.split(',').filter(Boolean) || []
      : [];
    const sizesFromUrl = searchParams.has('sizes')
      ? searchParams.get('sizes')?.split(',').filter(Boolean) || []
      : [];
    const pizzaTypesFromUrl = searchParams.has('pizzaTypes')
      ? searchParams.get('pizzaTypes')?.split(',').filter(Boolean) || []
      : [];

    setSelectedIngredients(new Set(ingredientsFromUrl));
    setSizes(new Set(sizesFromUrl));
    setPizzaTypes(new Set(pizzaTypesFromUrl));

    setPricesState({
      priceFrom: Number(searchParams.get('priceFrom')) || undefined,
      priceTo: Number(searchParams.get('priceTo')) || undefined,
    });
  }, [searchParams]);

  // Toggle функции для чекбоксов
  const toggleIngredients = useCallback((value: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  const toggleSizes = useCallback((value: string) => {
    setSizes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  const togglePizzaTypes = useCallback((value: string) => {
    setPizzaTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  const updatePrice = useCallback((name: keyof PriceProps, value: number) => {
    setPricesState(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedIngredients(new Set());
    setSizes(new Set());
    setPizzaTypes(new Set());
    setPricesState({});
  }, []);

  const hasFilters =
    sizes.size > 0 ||
    pizzaTypes.size > 0 ||
    selectedIngredients.size > 0 ||
    (prices.priceFrom !== undefined && prices.priceFrom !== DEFAULT_MIN_PRICE) ||
    (prices.priceTo !== undefined && prices.priceTo !== DEFAULT_MAX_PRICE);

  return useMemo(
    () => ({
      sizes,
      pizzaTypes,
      selectedIngredients,
      prices,
      setPrices: updatePrice,
      setPizzaTypes: togglePizzaTypes,
      setSizes: toggleSizes,
      setSelectedIngredients: toggleIngredients,
      resetFilters,
      hasFilters,
    }),
    [
      sizes,
      pizzaTypes,
      selectedIngredients,
      prices,
      updatePrice,
      togglePizzaTypes,
      toggleSizes,
      toggleIngredients,
      resetFilters,
      hasFilters,
    ],
  );
};
