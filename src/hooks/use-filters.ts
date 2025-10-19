import { useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { useSet } from 'react-use';

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
  const [selectedIngredients, { toggle: toggleIngredients, reset: resetIngredients }] = useSet(
    new Set<string>(searchParams.get('ingredients')?.split(',')),
  );

  // const { ingredients, loading, onAddId, selectedIngredients } = useFilterIngredients(
  //   searchParams.get('ingredients')?.split(','),
  // );

  /*Фильтр размeров*/
  const [sizes, { toggle: toggleSizes, reset: resetSizes }] = useSet(
    new Set<string>(searchParams.has('sizes') ? searchParams.get('sizes')?.split(',') : []),
  );

  /*Фильтр типа пиццы*/
  const [pizzaTypes, { toggle: togglePizzaTypes, reset: resetPizzaTypes }] = useSet(
    new Set<string>(searchParams.has('sizes') ? searchParams.get('sizes')?.split(',') : []),
  );

  /*Фильтр цены*/
  const [prices, setPrices] = React.useState<PriceProps>({
    priceFrom: Number(searchParams.get('priceFrom')) || undefined,
    priceTo: Number(searchParams.get('priceTo')) || undefined,
  });

  const updatePrice = (name: keyof PriceProps, value: number) => {
    setPrices(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const resetFilters = () => {
    resetIngredients();
    resetSizes();
    resetPizzaTypes();
    setPrices({});
  };

  const hasFilters =
    sizes.size > 0 ||
    pizzaTypes.size > 0 ||
    selectedIngredients.size > 0 ||
    prices.priceFrom !== undefined ||
    prices.priceTo !== undefined;

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
    [sizes, pizzaTypes, selectedIngredients, prices],
  );
};
