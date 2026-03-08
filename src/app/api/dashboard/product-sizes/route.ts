import { revalidateProductVariants } from '@/lib/revalidate-product';
import { verifyDashboardPermissions } from '@/lib/verify-dashboard-permissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

// ✅ Кеширование размеров (обновляется каждый час)
export const revalidate = 3600;

// 📋 GET - Получение всех размеров
export async function GET() {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const sizes = await prisma.size.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        value: true,
        sortOrder: true,
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.error('[PRODUCT_SIZES_GET] Error:', error);
    return NextResponse.json({ message: 'Errore nel caricamento dei formati' }, { status: 500 });
  }
}

// ➕ POST - Создание нового размера
export async function POST(req: NextRequest) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const data = await req.json();

    // Валидация
    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json({ message: 'Il nome del formato è obbligatorio' }, { status: 400 });
    }

    if (!data.value || isNaN(Number(data.value))) {
      return NextResponse.json(
        { message: 'Il valore del formato è obbligatorio' },
        { status: 400 },
      );
    }

    // Проверка на дубликат по имени
    const existingByName = await prisma.size.findUnique({
      where: { name: data.name.trim() },
    });

    if (existingByName) {
      return NextResponse.json(
        { message: 'Un formato con questo nome esiste già' },
        { status: 409 },
      );
    }

    // Создание размера
    const newSize = await prisma.size.create({
      data: {
        name: data.name.trim(),
        value: Number(data.value),
        sortOrder: data.sortOrder || 0,
      },
      select: {
        id: true,
        name: true,
        value: true,
        sortOrder: true,
      },
    });

    // ✅ Инвалидируем кеш размеров и главную страницу
    await revalidateProductVariants();

    return NextResponse.json(newSize, { status: 201 });
  } catch (error: unknown) {
    console.error('[PRODUCT_SIZES_POST] Server error:', error);

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Un formato con questi dati esiste già' },
        { status: 409 },
      );
    }

    return NextResponse.json({ message: 'Impossibile creare il formato' }, { status: 500 });
  }
}
