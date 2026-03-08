import { CreateProductSizeData, UpdateProductSizeData } from './product-size-types';

/**
 * Валидация данных размера продукта
 */
export const validateProductSizeData = (
  data: CreateProductSizeData | UpdateProductSizeData,
): string | null => {
  if (!data.name.trim()) {
    return 'Il nome non può essere vuoto';
  }

  if (!data.value || data.value <= 0) {
    return 'Inserisci un valore valido maggiore di zero';
  }

  return null;
};

/**
 * Форматирование значения размера
 */
export const formatSizeValue = (value: number): string => {
  return value.toString();
};

/**
 * Проверка уникальности имени
 * ✅ Оставляем: Имя должно быть уникальным (Piccola Pizza, Piccola Bibita)
 */
export const isDuplicateName = (
  name: string,
  sizes: Array<{ name: string; id: number }>,
  excludeId?: number,
): boolean => {
  return sizes.some(
    size => size.name.toLowerCase() === name.toLowerCase() && size.id !== excludeId,
  );
};
