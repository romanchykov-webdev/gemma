import { Variant } from '@/components/shared/group-variants';
import { PizzaSize, PizzaType } from '@/constants/pizza';
import { getAvailablePizzaSizes } from '@/lib';
import { useEffect, useState } from 'react';
import { useSet } from 'react-use';
import { OptimizedProductItem } from '../../@types/prisma';

interface ReturnProps {
  size: PizzaSize;
  type: PizzaType;
  selectedIngredients: Set<number>;
  availableSizes: Variant[];
  currentItemId?: number;
  setSize: (size: PizzaSize) => void;
  setType: (type: PizzaType) => void;
  addIngredient: (id: number) => void;
}

export const usePizzaOptions = (items: OptimizedProductItem[]): ReturnProps => {
  //
  const [size, setSize] = useState<PizzaSize>(20);

  const [type, setType] = useState<PizzaType>(1);

  const [selectedIngredients, { toggle: addIngredient }] = useSet(new Set<number>([]));

  const availableSizes = getAvailablePizzaSizes(type, items);

  const currentItemId = items.find(
    item => item.type?.value === type && item.size?.value === size,
  )?.id;

  useEffect(() => {
    const isAvailableSize = availableSizes?.find(
      item => Number(item.value) === size && !item.disabled,
    );
    const availableSize = availableSizes?.find(item => !item.disabled);

    if (!isAvailableSize && availableSize) {
      setSize(Number(availableSize.value) as PizzaSize);
    }
  }, [type, availableSizes, size]);

  return {
    size,
    type,
    selectedIngredients,
    availableSizes,
    currentItemId,
    setType,
    setSize,
    addIngredient,
  };
};
