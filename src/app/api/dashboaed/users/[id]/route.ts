import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma-client';

// PATCH - обновить пользователя
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await req.json();

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'Utente non trovato' }, { status: 404 });
    }

    // Если меняется email, проверяем на уникальность
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: 'Questo indirizzo email è già in uso' },
          { status: 400 },
        );
      }
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.address !== undefined && { address: body.address || null }),
        ...(body.role && { role: body.role }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        provider: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_PATCH] Error:', error);
    return NextResponse.json({ message: "Errore nell'aggiornamento dell'utente" }, { status: 500 });
  }
}

// DELETE - удалить пользователя
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'Utente non trovato' }, { status: 404 });
    }

    // Предупреждение, если у пользователя есть заказы
    if (existingUser._count.orders > 0) {
      return NextResponse.json(
        {
          message: `Impossibile eliminare. L'utente ha ${existingUser._count.orders} ordini associati.`,
        },
        { status: 400 },
      );
    }

    // Удаляем пользователя
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[USER_DELETE] Error:', error);
    return NextResponse.json({ message: "Errore nell'eliminazione dell'utente" }, { status: 500 });
  }
}
