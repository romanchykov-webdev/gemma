import { CreateCategoryData, UpdateCategoryData } from './category-types';

/**
 * Валидация данных категории
 */
export const validateCategoryData = (
  data: CreateCategoryData | UpdateCategoryData,
): string | null => {
  if (!data.name.trim()) {
    return 'Il nome della categoria non può essere vuoto';
  }

  if (data.name.trim().length < 2) {
    return 'Il nome deve contenere almeno 2 caratteri';
  }

  return null;
};

/**
 * Проверка возможности удаления категории
 */
export const canDeleteCategory = (productsCount: number): boolean => {
  return productsCount === 0;
};

/**
 * Получение сообщения об ошибке при попытке удалить категорию с продуктами
 */
export const getDeleteErrorMessage = (productsCount: number): string => {
  return `Impossibile eliminare. La categoria contiene ${productsCount} prodotti. Prima di eliminare una categoria, rimuovi o sposta tutti i prodotti da essa.`;
};
