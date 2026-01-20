import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma-client';

// 🔄 PATCH - Обновление статуса заказа
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const data = await req.json();

    // Валидация статуса
    const validStatuses = ['PENDING', 'SUCCEEDED', 'CANCELLED'];
    if (!data.status || !validStatuses.includes(data.status)) {
      return NextResponse.json({ message: 'Stato non valido' }, { status: 400 });
    }

    // Проверка существования заказа
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: 'Ordine non trovato' }, { status: 404 });
    }

    // Обновление статуса
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        totalAmount: true,
        status: true,
        paymentId: true,
        items: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    // Конвертируем Decimal в number
    const orderWithNumber = {
      ...updatedOrder,
      totalAmount: Number(updatedOrder.totalAmount),
    };

    return NextResponse.json(orderWithNumber);
  } catch (error) {
    console.error('[ORDER_PATCH] Server error:', error);
    return NextResponse.json({ message: "Impossibile aggiornare l'ordine" }, { status: 500 });
  }
}

// 🗑️ DELETE - Удаление заказа (опционально)
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;

    // Проверка существования
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: 'Ordine non trovato' }, { status: 404 });
    }

    // Удаление заказа
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ORDER_DELETE] Server error:', error);
    return NextResponse.json({ message: "Impossibile eliminare l'ordine" }, { status: 500 });
  }
}
