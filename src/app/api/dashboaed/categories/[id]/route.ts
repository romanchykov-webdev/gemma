import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma-client';

// ✏️ PATCH - Обновление категории
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const data = await req.json();

    // Валидация ID
    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID categoria non valido' }, { status: 400 });
    }

    // Валидация имени
    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Il nome della categoria è obbligatorio' },
        { status: 400 },
      );
    }

    // Проверка существования категории
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ message: 'Categoria non trovata' }, { status: 404 });
    }

    // Проверка на дубликат имени (исключая текущую категорию)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: 'insensitive',
        },
        NOT: {
          id: id,
        },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { message: 'Una categoria con questo nome esiste già' },
        { status: 409 },
      );
    }

    // Обновление категории
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: data.name.trim(),
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // ✅ Инвалидируем главную страницу
    revalidatePath('/');

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('[CATEGORIES_PATCH] Server error:', error);
    return NextResponse.json({ message: 'Impossibile aggiornare la categoria' }, { status: 500 });
  }
}

// 🗑️ DELETE - Удаление категории
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    // Валидация ID
    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID categoria non valido' }, { status: 400 });
    }

    // Проверка существования категории
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ message: 'Categoria non trovata' }, { status: 404 });
    }

    // Проверка на наличие продуктов
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        {
          message: `Impossibile eliminare. La categoria contiene ${existingCategory._count.products} prodotti`,
        },
        { status: 409 },
      );
    }

    // Удаление категории
    await prisma.category.delete({
      where: { id },
    });

    // ✅ Инвалидируем главную страницу
    revalidatePath('/');

    return NextResponse.json({ message: 'Categoria eliminata con successo' }, { status: 200 });
  } catch (error) {
    console.error('[CATEGORIES_DELETE] Server error:', error);
    return NextResponse.json({ message: 'Impossibile eliminare la categoria' }, { status: 500 });
  }
}
