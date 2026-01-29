import { Size, Type } from '@prisma/client';
import { BaseIngredient, ProductVariant } from '../../@types/prisma';

/**
 * Интерфейс для сырого товара из API
 */
export interface RawCartItem {
  id: string;
  productId: number;
  variantId: number;
  quantity: number;
  addedIngredientIds: number[];

  // ✅ НОВОЕ - полный snapshot базовых ингредиентов
  baseIngredientsSnapshot?: BaseIngredient[];

  // ⚠️ СТАРОЕ - для обратной совместимости (можно удалить позже)
  removedBaseIngredientIds?: number[];

  product: {
    id: number;
    name: string;
    imageUrl: string;
    variants: ProductVariant[];
    // ✅ ОБНОВЛЕНО - теперь baseIngredients содержит полную структуру
    baseIngredients?: BaseIngredient[];
  };
  ingredients: Array<{
    id: number;
    name: string;
    imageUrl: string;
    price: number | string;
  }>;
}

/**
 * Вычисляет цену одного товара в корзине
 * Использует baseIngredientsSnapshot для определения удаленных ингредиентов
 */
export function calculateItemPrice(
  item: RawCartItem,
  sizes: Size[],
  types: Type[],
): {
  price: number;
  size: number | null;
  type: number | null;
  sizeName: string | null;
  typeName: string | null;
  removedIngredients: Array<{ name: string }>;
} {
  // Находим вариант продукта
  const variants = item.product.variants as ProductVariant[];
  const variant = variants.find(v => v.variantId === item.variantId);

  // ✅ Если вариант не найден - выводим ошибку и возвращаем нули
  if (!variant) {
    console.error(`❌ [calculateItemPrice] Variant not found:`, {
      variantId: item.variantId,
      productId: item.productId,
      productName: item.product.name,
      availableVariants: variants.map(v => v.variantId),
    });

    return {
      price: 0,
      size: null,
      type: null,
      sizeName: null,
      typeName: null,
      removedIngredients: [],
    };
  }

  // Вычисляем цену ингредиентов
  const ingredientsPrice = item.ingredients.reduce((sum, ing) => {
    return sum + Number(ing.price);
  }, 0);

  // Итоговая цена
  const totalPrice = (variant.price + ingredientsPrice) * item.quantity;

  // Находим size и type по ID из варианта
  const size = sizes.find(s => s.id === variant.sizeId);
  const type = types.find(t => t.id === variant.typeId);

  // ✅ НОВАЯ ЛОГИКА - получаем удаленные ингредиенты из snapshot
  let removedIngredients: Array<{ name: string }> = [];

  if (item.baseIngredientsSnapshot && item.baseIngredientsSnapshot.length > 0) {
    // ✅ НОВЫЙ ПОДХОД - используем snapshot
    // Фильтруем ингредиенты с isDisabled = true
    removedIngredients = (item.baseIngredientsSnapshot as BaseIngredient[])
      .filter(ing => ing.isDisabled && ing.removable)
      .map(ing => ({ name: ing.name }));

    // console.log("✅ [calculateItemPrice] Using snapshot, removed:", removedIngredients);
  } else if (item.removedBaseIngredientIds && item.removedBaseIngredientIds.length > 0) {
    // ⚠️ СТАРЫЙ ПОДХОД - fallback для совместимости
    const baseIngredients = (item.product.baseIngredients || []) as BaseIngredient[];

    removedIngredients = baseIngredients
      .filter(ing => item.removedBaseIngredientIds!.includes(ing.id))
      .map(ing => ({ name: ing.name }));

    console.log(
      '⚠️ [calculateItemPrice] Using legacy removedBaseIngredientIds:',
      removedIngredients,
    );
  }

  return {
    price: totalPrice,
    size: size?.value || null,
    type: type?.value || null,
    sizeName: size?.name || null,
    typeName: type?.name || null,
    removedIngredients,
  };
}
