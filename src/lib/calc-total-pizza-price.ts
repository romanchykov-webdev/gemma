import { PizzaSize, PizzaType } from '@/constants/pizza';
import { Ingredient, ProductItem } from '@prisma/client';

/**
 * Функция для подсчета общей стоимости пиццы
 *
 * @param type - тип теста выбранной пиццы
 * @param size - размер выбранной пиццы
 * @param items - список вариаций
 I
 * @param ingredients - список ингредиентов
 * @param selectedIngredientsIds - выбранные ингредиенты
 @returns number общую стоимость
 */

export const calcTotalPizzaPrice = (
  type: PizzaType,
  size: PizzaSize,
  items: ProductItem[] = [],
  ingredients: Ingredient[],
  selectedIngredientsIds: Set<number>,
) => {
  const pizzaPrice = items?.find(item => item.pizzaType === type && item.size === size)?.price || 0;

  const totalIngredientsPrice = ingredients
    .filter(ingredient => selectedIngredientsIds.has(ingredient.id))
    .reduce((acc, val) => {
      return acc + val.price;
    }, 0);
  return pizzaPrice + totalIngredientsPrice;
};
