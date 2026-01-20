import { CreateProductData, UpdateProductData } from './product-types';

/**
 * Валидация данных продукта
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
 * Валидация вариантов продукта
 */
export const validateProductVariants = (variants: Array<{ price: number }>): string | null => {
  if (variants.length === 0) {
    return 'Aggiungi almeno una variante del prodotto';
  }

  const invalidVariant = variants.find(v => !v.price || v.price <= 0);
  if (invalidVariant) {
    return 'Tutte le varianti devono avere un prezzo valido';
  }

  return null;
};

/**
 * Форматирование цены
 */
export const formatPrice = (price: number | { toString(): string }): string => {
  const numericPrice = typeof price === 'number' ? price : Number(price);
  return `${numericPrice.toFixed(2)} €`;
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
export const getVariantsCount = (product: { items: unknown[] }): number => {
  return product.items?.length || 0;
};

/**
 * Проверка наличия ингредиентов
 */
export const hasIngredients = (product: { ingredients?: unknown[] }): boolean => {
  return (product.ingredients?.length || 0) > 0;
};
