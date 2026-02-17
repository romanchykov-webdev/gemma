import { verifyDashboardPermissions } from '@/lib/verify-dashboard-permissions';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

// ✅ Кеширование ингредиентов (обновляется каждый час)
export const revalidate = 3600;

// 📋 GET - уже существует в /api/ingredients/route.ts

// ➕ POST - Создание нового ингредиента
export async function POST(req: NextRequest) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const data = await req.json();

    // Валидация
    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json(
        { message: "Il nome dell'ingrediente è obbligatorio" },
        { status: 400 },
      );
    }

    if (!data.price || isNaN(Number(data.price))) {
      return NextResponse.json({ message: 'Il prezzo è obbligatorio' }, { status: 400 });
    }

    if (!data.imageUrl || data.imageUrl.trim().length === 0) {
      return NextResponse.json({ message: "L'immagine è obbligatoria" }, { status: 400 });
    }

    // Проверка на дубликат
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingIngredient) {
      return NextResponse.json(
        { message: 'Un ingrediente con questo nome esiste già' },
        { status: 409 },
      );
    }

    // Создание ингредиента с Decimal
    const newIngredient = await prisma.ingredient.create({
      data: {
        name: data.name.trim(),
        price: Number(data.price),
        imageUrl: data.imageUrl.trim(),
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
      },
    });

    // ✅ Инвалидируем кеш ингредиентов и главную страницу
    revalidatePath('/');

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error: unknown) {
    console.error('[INGREDIENTS_POST] Server error:', error);

    // 🔥 Обработка ошибки sequence
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002' &&
      'meta' in error &&
      typeof error.meta === 'object' &&
      error.meta !== null &&
      'target' in error.meta &&
      Array.isArray(error.meta.target) &&
      error.meta.target.includes('id')
    ) {
      return NextResponse.json(
        { message: "Errore del database. Contatta l'amministratore per resettare la sequence." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Impossibile creare l'ingrediente" }, { status: 500 });
  }
}
