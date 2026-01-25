import Fuse from 'fuse.js';
import { ProductWithRelations } from '../../@types/prisma';
import { CategoryWithProducts } from './find-pizza';

/**
 * Локальный поиск по продуктам с использованием Fuse.js
 * @param categories - все категории с продуктами из стора
 * @param query - поисковый запрос
 * @param limit - максимальное количество результатов
 * @returns массив найденных продуктов
 */
export const searchProductsLocally = (
  categories: CategoryWithProducts[],
  query: string,
  limit: number = 10,
): ProductWithRelations[] => {
  // ✅ Если запрос пустой или слишком короткий
  if (!query || query.length < 2) return [];

  // ✅ Собираем все продукты в плоский массив
  const allProducts = categories.flatMap(cat => cat.products);

  // ✅ Настройки Fuse.js для fuzzy search
  const fuse = new Fuse(allProducts, {
    keys: ['name'], // Поля для поиска
    threshold: 0.3, // Чувствительность (0 = точное совпадение, 1 = любое)
    includeScore: true,
    minMatchCharLength: 2, // Минимум 2 символа для поиска
    ignoreLocation: true, // Игнорировать позицию совпадения
  });

  // ✅ Выполняем поиск
  const results = fuse.search(query);

  // ✅ Возвращаем только элементы (без метаданных)
  return results.slice(0, limit).map(result => result.item);
};
