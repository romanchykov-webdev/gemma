import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

// ✅ Кеширование на 1 час (3600 секунд)
export const revalidate = false;

// ✅ Тип для кешированных ингредиентов
type CachedIngredient = {
  id: number;
  name: string;
  price: number | Decimal;
  imageUrl: string;
};

// ✅ In-memory кеш для быстрого доступа
let cachedIngredients: CachedIngredient[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 час в миллисекундах

export async function GET() {
  const now = Date.now();

  // ✅ Если кеш свежий - возвращаем сразу (экономия ~2 секунды)
  if (cachedIngredients && now - cacheTime < CACHE_TTL) {
    return NextResponse.json(cachedIngredients);
  }

  // ✅ Иначе - загружаем из БД
  const ingredients = await prisma.ingredient.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  // ✅ Сохраняем в кеш
  cachedIngredients = ingredients;
  cacheTime = now;

  return NextResponse.json(ingredients);
}
