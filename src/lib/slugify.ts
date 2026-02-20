/**
 * Преобразует строку в чистый URL-friendly slug.
 * "Pizza Margherita!" -> "pizza-margherita"
 */
export function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // Пробелы в дефисы
      .replace(/[^\w\-а-яёa-z0-9]+/gi, '-') // Удаляем спецсимволы
      .replace(/-+/g, '-') // Убираем двойные дефисы --
      .replace(/^-|-$/g, '') || // Убираем дефисы в начале и конце
    'product'
  );
}
