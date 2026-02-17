import { revalidateStories } from '@/lib/revalidate-product';
import { verifyDashboardPermissions } from '@/lib/verify-dashboard-permissions';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export const revalidate = 30;

// GET - получить все stories с items
export async function GET() {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const stories = await prisma.story.findMany({
      select: {
        id: true,
        previewImageUrl: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          select: {
            id: true,
            sourceUrl: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('[STORIES_GET] Error:', error);
    return NextResponse.json({ message: 'Errore nel recupero delle storie' }, { status: 500 });
  }
}

// POST - создать новую story
export async function POST(req: Request) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const body = await req.json();
    const { previewImageUrl, items } = body;

    // Валидация
    if (!previewImageUrl || typeof previewImageUrl !== 'string') {
      return NextResponse.json(
        { message: "L'URL dell'immagine di anteprima è obbligatorio" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Almeno un elemento della storia è obbligatorio' },
        { status: 400 },
      );
    }

    // Валидация каждого item
    for (const item of items) {
      if (!item.sourceUrl || typeof item.sourceUrl !== 'string') {
        return NextResponse.json(
          { message: 'Tutti gli elementi devono avere un URL valido' },
          { status: 400 },
        );
      }
    }

    // Создаем story с items
    const story = await prisma.story.create({
      data: {
        previewImageUrl,
        items: {
          create: items.map((item: { sourceUrl: string }) => ({
            sourceUrl: item.sourceUrl,
          })),
        },
      },
      select: {
        id: true,
        previewImageUrl: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          select: {
            id: true,
            sourceUrl: true,
            createdAt: true,
          },
        },
      },
    });

    // ✅ Инвалидируем кеш историй
    revalidateStories();

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('[STORIES_POST] Error:', error);
    return NextResponse.json({ message: 'Errore nella creazione della storia' }, { status: 500 });
  }
}
