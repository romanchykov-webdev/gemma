import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export const revalidate = 3600;

// GET - Получить все типы теста
export async function GET() {
  try {
    const types = await prisma.type.findMany({
      orderBy: { sortOrder: 'asc' },
      // include: {
      // 	_count: {
      // 		select: { productItems: true },
      // 	},
      // },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error('[DOUGH_TYPES_GET] Error:', error);
    return NextResponse.json({ message: 'Errore nel caricamento' }, { status: 500 });
  }
}

// POST - Создать тип теста (value генерируется автоматически)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json({ message: 'Il nome è obbligatorio' }, { status: 400 });
    }

    // Проверка на дубликат по имени
    const existingByName = await prisma.type.findUnique({
      where: { name: data.name.trim() },
    });

    if (existingByName) {
      return NextResponse.json(
        { message: 'Tipo di impasto con questo nome esiste già' },
        { status: 409 },
      );
    }

    // 🔥 Автоматическое генерирование value (максимальное + 1)
    const maxValueType = await prisma.type.findFirst({
      orderBy: { value: 'desc' },
      select: { value: true },
    });

    const nextValue = maxValueType ? maxValueType.value + 1 : 1;

    const newType = await prisma.type.create({
      data: {
        name: data.name.trim(),
        value: nextValue, // 🔥 Генерируется автоматически
        sortOrder: data.sortOrder || 0,
      },
      // include: {
      // 	_count: {
      // 		select: { productItems: true },
      // 	},
      // },
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error('[DOUGH_TYPES_POST] Error:', error);
    return NextResponse.json({ message: 'Impossibile creare' }, { status: 500 });
  }
}
