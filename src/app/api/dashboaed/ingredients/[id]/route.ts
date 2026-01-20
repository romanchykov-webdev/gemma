import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma-client';

// ✏️ PATCH - Обновление ингредиента
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const data = await req.json();

    // Валидация ID
    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID ingrediente non valido' }, { status: 400 });
    }

    // Проверка существования ингредиента
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
    });

    if (!existingIngredient) {
      return NextResponse.json({ message: 'Ingrediente non trovato' }, { status: 404 });
    }

    // Валидация данных
    if (data.name && data.name.trim().length === 0) {
      return NextResponse.json({ message: 'Il nome non può essere vuoto' }, { status: 400 });
    }

    if (data.price !== undefined && isNaN(Number(data.price))) {
      return NextResponse.json({ message: 'Il prezzo non è valido' }, { status: 400 });
    }

    // Проверка на дубликат имени (исключая текущий ингредиент)
    if (data.name) {
      const duplicateIngredient = await prisma.ingredient.findFirst({
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

      if (duplicateIngredient) {
        return NextResponse.json(
          { message: 'Un ingrediente con questo nome esiste già' },
          { status: 409 },
        );
      }
    }

    // Обновление ингредиента
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.price !== undefined && { price: Number(data.price) }),
        ...(data.imageUrl && { imageUrl: data.imageUrl.trim() }),
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(updatedIngredient);
  } catch (error) {
    console.error('[INGREDIENTS_PATCH] Server error:', error);
    return NextResponse.json({ message: "Impossibile aggiornare l'ingrediente" }, { status: 500 });
  }
}

// 🗑️ DELETE - Удаление ингредиента
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    // Валидация ID
    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID ingrediente non valido' }, { status: 400 });
    }

    // Проверка существования ингредиента
    // Проверка существования ингредиента
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
      select: {
        id: true,
        cartItems: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingIngredient) {
      return NextResponse.json({ message: 'Ingrediente non trovato' }, { status: 404 });
    }

    // Проверка на использование в корзинах
    if (existingIngredient.cartItems.length > 0) {
      return NextResponse.json(
        {
          message: `Impossibile eliminare. L'ingrediente è usato in ${existingIngredient.cartItems.length} carrelli`,
        },
        { status: 409 },
      );
    }

    // Удаление ингредиента
    await prisma.ingredient.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Ingrediente eliminato con successo' }, { status: 200 });
  } catch (error) {
    console.error('[INGREDIENTS_DELETE] Server error:', error);
    return NextResponse.json({ message: "Impossibile eliminare l'ingrediente" }, { status: 500 });
  }
}
