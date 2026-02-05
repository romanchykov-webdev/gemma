'use server';

import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../prisma/prisma-client';
import { getUserSession } from '@/lib/get-user-session';
import { adminRoles } from '@/constants/auth-options';

// 🔄 Server Action для обновления статуса заказа
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    // 🔐 Проверка авторизации
    const session = await getUserSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // ✅ Проверка прав доступа
    const user = await prisma.user.findFirst({
      where: { id: session.id },
      select: { role: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!adminRoles.includes(user.role)) {
      return { success: false, error: 'Forbidden' };
    }

    // ⚡ Обновление статуса заказа
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // 🔄 Инвалидация кеша страницы заказов
    revalidatePath('/orders');

    return { success: true };
  } catch (error) {
    console.error('[UPDATE_ORDER_STATUS] Error:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}
