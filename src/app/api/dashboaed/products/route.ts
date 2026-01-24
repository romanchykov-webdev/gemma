import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

// ✅ Кеширование
export const revalidate = 60;

// 📋 GET - Получение всех продуктов (с фильтром по категории)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    const products = await prisma.product.findMany({
      where: categoryId
        ? {
            categoryId: Number(categoryId),
          }
        : {},
      select: {
        id: true,
        name: true,
        imageUrl: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
        baseIngredients: true,
        addableIngredientIds: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET] Server error:', error);
    return NextResponse.json({ message: 'Impossibile recuperare i prodotti' }, { status: 500 });
  }
}

// ➕ POST - Создание нового продукта
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Валидация
    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json({ message: 'Il nome del prodotto è obbligatorio' }, { status: 400 });
    }

    if (!data.imageUrl || data.imageUrl.trim().length === 0) {
      return NextResponse.json({ message: "L'immagine è obbligatoria" }, { status: 400 });
    }

    if (!data.categoryId) {
      return NextResponse.json({ message: 'La categoria è obbligatoria' }, { status: 400 });
    }

    // Проверка существования категории
    const category = await prisma.category.findUnique({
      where: { id: Number(data.categoryId) },
    });

    if (!category) {
      return NextResponse.json({ message: 'Categoria non trovata' }, { status: 404 });
    }

    // Создание продукта с items и ingredients
    const newProduct = await prisma.product.create({
      data: {
        name: data.name.trim(),
        imageUrl: data.imageUrl.trim(),
        categoryId: Number(data.categoryId),
        variants: data.variants || [],
        baseIngredients: data.baseIngredients || {},
        addableIngredientIds: data.addableIngredientIds || [],
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
        baseIngredients: true,
        addableIngredientIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // ✅ Инвалидируем кеш главной страницы
    revalidatePath('/');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('[PRODUCTS_POST] Server error:', error);
    return NextResponse.json({ message: 'Impossibile creare il prodotto' }, { status: 500 });
  }
}
