import { CreateProductData, UpdateProductData } from './product-types';

/**
 * Валидация основных данных продукта (Metadata)
 */
export const validateProductData = (
  data: Partial<CreateProductData> | Partial<UpdateProductData>,
): string | null => {
  if (!data.name || !data.name.trim()) {
    return 'Il nome del prodotto è obbligatorio';
  }

  if (!data.imageUrl || !data.imageUrl.trim()) {
    return "L'URL dell'immagine è obbligatorio";
  }

  if (!data.categoryId) {
    return 'Seleziona una categoria';
  }

  try {
    new URL(data.imageUrl);
  } catch {
    return "Inserisci un URL valido per l'immagine";
  }

  return null;
};

/**
 * Форматирование цены
 */
export const formatPrice = (price: number | { toString(): string }): string => {
  const numericPrice = typeof price === 'number' ? price : Number(price);
  return `${isNaN(numericPrice) ? 0 : numericPrice.toFixed(2)} €`;
};

/**
 * Получение имени категории по ID
 */
export const getCategoryName = (
  categoryId: number,
  categories: Array<{ id: number; name: string }>,
): string => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Sconosciuta';
};

/**
 * Получение количества вариантов

 */
export const getVariantsCount = (product: { variants?: unknown[] }): number => {
  return product.variants?.length || 0;
};

/**
 * Проверка наличия ингредиентов

 */
export const hasIngredients = (product: { baseIngredients?: unknown[] }): boolean => {
  return (product.baseIngredients?.length || 0) > 0;
};
