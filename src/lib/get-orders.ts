import { cache } from 'react';
import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';
import { OrderFilters, OrderFromDB } from '@/@types/orders';

// 🔥 Функция получения заказов с оптимизацией и кешированием
// ⚡ Используем React.cache() для оптимизации
export const getOrders = cache(async (filters: OrderFilters): Promise<OrderFromDB[]> => {
  try {
    // 🔍 Формируем фильтры для запроса
    const where: Prisma.OrderWhereInput = {};

    // Фильтр по статусу
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status as OrderStatus;
    }

    // Фильтр по дате (за весь день)
    if (filters.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      where.createdAt = {
        gte: date,
        lt: nextDay,
      };
    }

    // ⚡ Оптимизированный запрос с select вместо include
    // ✅ Следуем best practices проекта
    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        comment: true,
        paymentId: true,
        items: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc', // Новые заказы сверху
      },
    });

    // Преобразуем Decimal в number для сериализации
    return orders.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    }));
  } catch (error) {
    console.error('[GET_ORDERS] Error:', error);
    throw new Error('Failed to fetch orders');
  }
});
