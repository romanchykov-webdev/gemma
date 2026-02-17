import { verifyDashboardPermissions } from '@/lib/verify-dashboard-permissions';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

// ✅ Кеширование
export const revalidate = 60;

// 📋 GET - Получение всех категорий с количеством продуктов
export async function GET() {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true, // Количество продуктов в категории
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET] Server error:', error);
    return NextResponse.json({ message: 'Impossibile recuperare le categorie' }, { status: 500 });
  }
}

// ➕ POST - Создание новой категории
export async function POST(req: NextRequest) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const data = await req.json();

    // Валидация
    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Il nome della categoria è obbligatorio' },
        { status: 400 },
      );
    }

    // Проверка на дубликат
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Una categoria con questo nome esiste già' },
        { status: 409 },
      );
    }

    // Создание категории
    const newCategory = await prisma.category.create({
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

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('[CATEGORIES_POST] Server error:', error);
    return NextResponse.json({ message: 'Impossibile creare la categoria' }, { status: 500 });
  }
}
