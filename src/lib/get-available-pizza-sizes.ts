import { pizzaSize, PizzaType } from '@/constants/pizza';
import { ProductItem } from '@prisma/client';
import { Variant } from '@/components/shared/group-variants';

/**
 *
 * @param type
 * @param items
 */

export const getAvailablePizzaSizes = (type: PizzaType, items: ProductItem[]): Variant[] => {
  const filteredPizzaByType = items?.filter(item => Number(item.pizzaType) === type);
  return pizzaSize.map(item => ({
    name: item.name,
    value: item.value,
    disabled: !filteredPizzaByType?.some(pizza => Number(pizza.size) === Number(item.value)),
  }));
};
