import { Ingredient, Size, Type } from '@prisma/client';
import { cache } from 'react';
import {
  BaseIngredient,
  OptimizedProductItem,
  ProductVariant,
  ProductWithRelations,
} from '../../@types/prisma';
import { prisma } from '../../prisma/prisma-client';

/**
 * 🔥 Обогащает данные продукта для UI
 * Используется в модальном окне и на странице продукта
 */
export function enrichProductData(
  productData: {
    id: number;
    name: string;
    imageUrl: string;
    categoryId: number;
    baseIngredients: unknown;
    variants: unknown;
  },
  allIngredients: Ingredient[],
  sizes: Size[],
  types: Type[],
): ProductWithRelations {
  // 1. Парсим JSON данные
  const baseIngrsFromDB = (productData.baseIngredients as BaseIngredient[]) || [];
  const variantsFromDB = (productData.variants as ProductVariant[]) || [];

  // 2. Обогащаем baseIngredients полными данными
  const enrichedBaseIngredients: BaseIngredient[] = baseIngrsFromDB.map(baseIng => {
    const fullIngredient = allIngredients.find(ing => ing.id === baseIng.id);

    return {
      id: baseIng.id,
      name: baseIng.name || fullIngredient?.name || `Ingredient ${baseIng.id}`,
      imageUrl: baseIng.imageUrl || fullIngredient?.imageUrl || '',
      removable: baseIng.removable ?? true,
      isDisabled: baseIng.isDisabled ?? false,
    };
  });

  // 3. Подготавливаем добавляемые ингредиенты для UI
  const ingredients = allIngredients
    .filter(ing => baseIngrsFromDB.some(bi => bi.id === ing.id))
    .map(ing => ({
      ...ing,
      price: Number(ing.price),
    }));

  // 4. Преобразуем variants в items для UI
  const items: OptimizedProductItem[] = variantsFromDB.map(v => {
    const sizeObj = sizes.find(s => s.id === v.sizeId);
    const typeObj = types.find(t => t.id === v.typeId);

    return {
      id: v.variantId,
      price: Number(v.price),
      sizeId: v.sizeId,
      typeId: v.typeId,
      productId: productData.id,
      size: sizeObj ? { value: sizeObj.value, name: sizeObj.name } : null,
      type: typeObj ? { value: typeObj.value, name: typeObj.name } : null,
    };
  });

  // 5. Формируем финальный объект
  return {
    ...productData,
    ingredients,
    items,
    variants: variantsFromDB,
    baseIngredients: enrichedBaseIngredients,
  };
}

/**
 * 🔥 Загружает справочники с кешированием
 * React cache - кеш на время SSR рендера
 */
export const getReferences = cache(async () => {
  const [sizes, types, ingredients] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.type.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.ingredient.findMany({
      select: { id: true, name: true, imageUrl: true, price: true },
    }),
  ]);

  return { sizes, types, ingredients };
});
