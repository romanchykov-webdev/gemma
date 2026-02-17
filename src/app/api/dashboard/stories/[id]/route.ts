import { revalidateStories } from '@/lib/revalidate-product';
import { verifyDashboardPermissions } from '@/lib/verify-dashboard-permissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma-client';

// PATCH - обновить story
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const params = await context.params;
    const id = Number(params.id);
    const body = await req.json();

    // Проверяем существование story
    const existingStory = await prisma.story.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingStory) {
      return NextResponse.json({ message: 'Storia non trovata' }, { status: 404 });
    }

    const { previewImageUrl, items } = body;

    // Валидация
    if (previewImageUrl !== undefined && typeof previewImageUrl !== 'string') {
      return NextResponse.json({ message: "URL dell'immagine non valido" }, { status: 400 });
    }

    // Обновляем транзакцией
    const updatedStory = await prisma.$transaction(async tx => {
      // Обновляем preview image если передан
      if (previewImageUrl) {
        await tx.story.update({
          where: { id },
          data: { previewImageUrl },
        });
      }

      // Если переданы items, обновляем их
      if (items && Array.isArray(items)) {
        // Удаляем старые items
        await tx.storyItem.deleteMany({
          where: { storyId: id },
        });

        // Создаем новые items
        if (items.length > 0) {
          await tx.storyItem.createMany({
            data: items.map((item: { sourceUrl: string }) => ({
              storyId: id,
              sourceUrl: item.sourceUrl,
            })),
          });
        }
      }

      // Возвращаем обновленную story
      return await tx.story.findUnique({
        where: { id },
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
      });
    });

    // ✅ Инвалидируем кеш историй
    revalidateStories();

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error('[STORY_PATCH] Error:', error);
    return NextResponse.json(
      { message: "Errore nell'aggiornamento della storia" },
      { status: 500 },
    );
  }
}

// DELETE - удалить story
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const params = await context.params;
    const id = Number(params.id);

    // Проверяем существование
    const existingStory = await prisma.story.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return NextResponse.json({ message: 'Storia non trovata' }, { status: 404 });
    }

    // 🔥 Удаляем транзакцией: сначала items, потом story
    await prisma.$transaction(async tx => {
      // Удаляем все items связанные с этой story
      await tx.storyItem.deleteMany({
        where: { storyId: id },
      });

      // Теперь удаляем саму story
      await tx.story.delete({
        where: { id },
      });
    });

    // ✅ Инвалидируем кеш историй
    revalidateStories();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[STORY_DELETE] Error:', error);
    return NextResponse.json({ message: "Errore nell'eliminazione della storia" }, { status: 500 });
  }
}
