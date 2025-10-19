import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';
// import { prisma } from '../../../../../prisma/prisma-client';

// Обработчик GET-запроса.
// Сигнатура строго фиксирована для Route Handlers: экспортируем функцию с именем HTTP-метода.
export async function GET(req: NextRequest) {
  // console.log(req.nextUrl.searchParams.get('query'));
  // Пример: /api/products/search?query=сыр
  // Берём значение параметра query из URL.
  // Если параметра нет, подставляем пустую строку.
  // ПРИМЕЧАНИЕ: Prisma с `contains: ''` вернёт все записи (это ожидаемое поведение).
  const query = req.nextUrl.searchParams.get('query') || '';

  // Делаем поиск по модели `product` (должна существовать в твоей Prisma-схеме).
  // Фильтруем по полю `name`, ищем вхождение подстроки (contains) без учёта регистра (mode: 'insensitive').
  // `take: 5` — ограничиваем количество результатов до 5, чтобы не перегружать ответ.
  const product = await prisma.product.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    // при желании можно добавить `orderBy: { name: 'asc' }` или выбрать конкретные поля через `select`
    take: 5,
  });

  // Возвращаем JSON-ответ со статусом 200.
  // NextResponse сам выставит заголовок Content-Type: application/json.
  return NextResponse.json(product);
}
