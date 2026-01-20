import { z } from 'zod';
import { BaseIngredient, ProductVariant } from './prisma';

// ✅ Zod схемы для JSON полей
export const ProductVariantSchema = z.object({
  variantId: z.number(),
  price: z.number(),
  sizeId: z.number(),
  typeId: z.number(),
});

export const BaseIngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  imageUrl: z.string().optional(),
  removable: z.boolean(),
  isDisabled: z.boolean().default(false),
});

// Массивы
export const ProductVariantsSchema = z.array(ProductVariantSchema);
export const BaseIngredientsSchema = z.array(BaseIngredientSchema);

// ✅ Безопасные парсеры для критичных мест (API, Store)
export function parseProductVariants(jsonValue: unknown): ProductVariant[] {
  const result = ProductVariantsSchema.safeParse(jsonValue);
  if (!result.success) {
    console.error('❌ [parseProductVariants] Invalid data:', result.error);
    return [];
  }
  return result.data;
}

export function parseBaseIngredients(jsonValue: unknown): BaseIngredient[] {
  const result = BaseIngredientsSchema.safeParse(jsonValue);
  if (!result.success) {
    console.error('❌ [parseBaseIngredients] Invalid data:', result.error);
    return [];
  }
  return result.data;
}

// ✅ Быстрое приведение для UI (без валидации)
export function asProductVariants(jsonValue: unknown): ProductVariant[] {
  return jsonValue as ProductVariant[];
}

export function asBaseIngredients(jsonValue: unknown): BaseIngredient[] {
  return jsonValue as BaseIngredient[];
}
