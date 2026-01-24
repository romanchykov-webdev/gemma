import { NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

// ✅ Кеширование
export const revalidate = false;

export async function GET() {
  // ✅ Оптимизация: загружаем только нужные поля
  const stories = await prisma.story.findMany({
    select: {
      id: true,
      previewImageUrl: true,
      items: {
        select: {
          id: true,
          sourceUrl: true,
        },
        orderBy: {
          id: 'asc',
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  return NextResponse.json(stories);
}
