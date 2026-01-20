import { PizzaSize, PizzaType } from '@/constants/pizza';
// ✅ Импортируем из @types/prisma вместо локального определения
import { OptimizedIngredient, OptimizedProductItem } from '../../@types/prisma';

/**
 * Функция для подсчета общей стоимости пиццы
 *
 * @param type - тип теста выбранной пиццы
 * @param size - размер выбранной пиццы
 * @param items - список вариаций
 * @param ingredients - список ингредиентов
 * @param selectedIngredientsIds - выбранные ингредиенты
 * @returns number общую стоимость
 */

export const calcTotalPizzaPrice = (
  type: PizzaType,
  size: PizzaSize,
  items: OptimizedProductItem[] = [],
  ingredients: OptimizedIngredient[],
  selectedIngredientsIds: Set<number>,
) => {
  const pizzaPrice =
    items?.find(item => item.type?.value === type && item.size?.value === size)?.price || 0;

  // ✅ price уже number, не нужен Number()
  const totalIngredientsPrice = ingredients
    .filter(ingredient => selectedIngredientsIds.has(ingredient.id))
    .reduce((acc, val) => {
      return acc + val.price;
    }, 0);

  return pizzaPrice + totalIngredientsPrice;
};
