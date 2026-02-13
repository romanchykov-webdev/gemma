import { OrderItemDTO } from '@/app/(checkout)/success/components/order-status-data';

/**
 * Считает полную стоимость одного товарной позиции.
 * 🛡️ Если item не передан или сломан — вернет 0.
 */
export const calculateOrderItemPrice = (item?: OrderItemDTO | null): number => {
  if (!item) {
    return 0;
  }

  // Защита от undefined цены ингредиентов
  const ingredientsPrice = item.ingredients?.reduce((acc, ing) => acc + (ing.price || 0), 0) || 0;

  // Защита от undefined цены товара и количества (чтобы не получить NaN)
  const basePrice = item.price || 0;
  const quantity = item.quantity || 1;

  return (basePrice + ingredientsPrice) * quantity;
};

/**
 * Формирует строку деталей (Размер • Тесто).
 * 🛡️ Если item не передан — вернет пустую строку.
 */
export const formatItemDetails = (item?: OrderItemDTO | null): string => {
  if (!item) {
    return '';
  }

  // Фильтруем undefined/null значения, чтобы не было дырок " • "
  return [item.sizeName, item.typeName].filter(Boolean).join(' • ');
};
