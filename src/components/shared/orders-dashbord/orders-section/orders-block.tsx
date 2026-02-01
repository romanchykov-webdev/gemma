import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { OrderItem } from './order-item';
import { prisma } from '../../../../../prisma/prisma-client';
import { Prisma } from '@prisma/client';

interface Props {
  className?: string;
  status?: string;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const OrdersBlock: React.FC<Props> = async ({
  className,
  status,
  searchQuery,
  dateFrom,
  dateTo,
}): Promise<JSX.Element> => {
  // 🔍 Формируем фильтры для запроса
  const where: Prisma.OrderWhereInput = {};

  // Фильтр по статусу
  if (status && status !== 'ALL') {
    where.status = status as 'PENDING' | 'SUCCEEDED' | 'CANCELLED';
  }

  // Фильтр по поиску (имя, телефон, email, ID)
  if (searchQuery) {
    where.OR = [
      { fullName: { contains: searchQuery, mode: 'insensitive' } },
      { phone: { contains: searchQuery } },
      { email: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  // Фильтр по датам
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  // ⚡ Получаем заказы из базы данных с оптимизацией
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
    take: 50, // Ограничение для производительности
  });

  return (
    <div className={cn('mt-10 mb-10', className)}>
      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-xl">📭 Nessun ordine trovato</p>
          <p className="text-sm mt-2">Prova a modificare i filtri di ricerca</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderItem
              key={order.id}
              order={{
                ...order,
                totalAmount: Number(order.totalAmount),
                // Преобразуем Prisma.JsonValue в нужный тип
                items: order.items as Record<string, unknown> | unknown[],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
