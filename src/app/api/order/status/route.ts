import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 📊 GET /api/order/status?orderId=xxx
// Возвращает статус заказа для табло отслеживания
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    // 🔍 Валидация: проверяем наличие orderId
    if (!orderId) {
      return NextResponse.json({ error: 'orderId è richiesto' }, { status: 400 });
    }

    // 🔍 Поиск заказа в БД
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        expectedReadyAt: true,
        readyAt: true,
        createdAt: true,
        fullName: true,
        totalAmount: true,
        address: true,
        type: true,
      },
    });

    // ❌ Заказ не найден
    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
    }

    // Проверяем тип (PICKUP или DELIVERY)
    const deliveryType = order.type === 'PICKUP' ? 'pickup' : 'delivery';

    // ✅ Возвращаем данные заказа
    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      expectedReadyAt: order.expectedReadyAt,
      readyAt: order.readyAt,
      createdAt: order.createdAt,
      fullName: order.fullName,
      totalAmount: Number(order.totalAmount),
      address: order.address,
      deliveryType: deliveryType,
    });
  } catch (error) {
    console.error('[ORDER_STATUS_API] Error:', error);
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 });
  }
}
