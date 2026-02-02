import { OrderFilters, OrderStats } from '@/@types/orders';
import { OrderStatus, Prisma } from '@prisma/client';
import { cache } from 'react';
import { prisma } from '../../prisma/prisma-client';

// 🔧 Извлечение имени и картинки продукта из item (Prisma CartItem или плоский формат)
function getProductFromItem(item: unknown): { name: string; imageUrl: string } | null {
  const typed = item as Record<string, unknown>;

  // Формат Prisma CartItem: product.name, product.imageUrl (как при сохранении из корзины)
  const product = typed.product as Record<string, unknown> | undefined;
  if (product && typeof product === 'object' && product.name) {
    return {
      name: String(product.name),
      imageUrl: String(product.imageUrl || '/logo.png'),
    };
  }

  // Плоский формат: productName, imageUrl на верхнем уровне
  if (typed.productName) {
    return {
      name: String(typed.productName),
      imageUrl: String(typed.imageUrl || '/logo.png'),
    };
  }

  return null;
}

// 🔥 Функция расчета статистики по заказам
// ⚡ Используем React.cache() и raw SQL для максимальной производительности
export const getOrdersStats = cache(async (filters: OrderFilters): Promise<OrderStats> => {
  try {
    // 🔍 Формируем WHERE условия для SQL
    const conditions: string[] = ['1=1']; // Базовое условие
    const values: unknown[] = [];
    let paramIndex = 1;

    // Фильтр по статусу (добавляем CAST для enum типа PostgreSQL)
    if (filters.status && filters.status !== 'ALL') {
      conditions.push(`status = CAST($${paramIndex}::text AS "OrderStatus")`);
      values.push(filters.status);
      paramIndex++;
    }

    // Фильтр по дате (за весь день)
    if (filters.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      conditions.push(`"createdAt" >= $${paramIndex}`);
      values.push(date);
      paramIndex++;

      conditions.push(`"createdAt" < $${paramIndex}`);
      values.push(nextDay);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // ⚡ Используем raw SQL для агрегации (быстрее чем Prisma)
    const stats = await prisma.$queryRawUnsafe<
      Array<{
        total_orders: number;
        total_revenue: string | null;
        avg_check: string | null;
        pending_count: number;
        succeeded_count: number;
      }>
    >(
      `
      SELECT 
        COUNT(*)::int as total_orders,
        SUM("totalAmount")::decimal as total_revenue,
        AVG("totalAmount")::decimal as avg_check,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int as pending_count,
        COUNT(CASE WHEN status = 'SUCCEEDED' THEN 1 END)::int as succeeded_count
      FROM "Order"
      WHERE ${whereClause}
    `,
      ...values,
    );

    const result = stats[0];

    // 🍕 Получение TOP продукта из items (JSON)
    const topProduct = await getTopProduct(filters);

    return {
      totalRevenue: Number(result.total_revenue) || 0,
      totalOrders: result.total_orders || 0,
      averageCheck: Number(result.avg_check) || 0,
      topProduct,
      statusCounts: {
        all: result.total_orders || 0,
        pending: result.pending_count || 0,
        succeeded: result.succeeded_count || 0,
      },
    };
  } catch (error) {
    console.error('[GET_ORDERS_STATS] Error:', error);
    throw new Error('Failed to fetch order statistics');
  }
});

// 🔧 Вспомогательная функция для получения самого популярного продукта
async function getTopProduct(filters: OrderFilters): Promise<OrderStats['topProduct']> {
  try {
    // Формируем WHERE условия
    const where: Prisma.OrderWhereInput = {};

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status as OrderStatus;
    }

    if (filters.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      where.createdAt = {
        gte: date,
        lt: nextDay,
      };
    }

    // Получаем все заказы с items
    const orders = await prisma.order.findMany({
      where,
      select: {
        items: true,
      },
    });

    if (orders.length === 0) {
      return null;
    }

    // 📊 Подсчитываем количество каждого продукта
    const productCounts = new Map<string, { name: string; imageUrl: string; count: number }>();

    function addItemToCounts(item: unknown) {
      const product = getProductFromItem(item);
      if (!product) return;

      const typedItem = item as Record<string, unknown>;
      const qty = Number(typedItem.quantity) || 1;
      const key = product.name;

      const existing = productCounts.get(key);
      if (existing) {
        existing.count += qty;
      } else {
        productCounts.set(key, {
          name: product.name,
          imageUrl: product.imageUrl,
          count: qty,
        });
      }
    }

    for (const order of orders) {
      const items = order.items;

      if (Array.isArray(items)) {
        for (const item of items) {
          addItemToCounts(item);
        }
      } else if (typeof items === 'object' && items !== null) {
        const itemsObj = items as Record<string, unknown>;
        for (const category of Object.values(itemsObj)) {
          if (Array.isArray(category)) {
            for (const item of category) {
              addItemToCounts(item);
            }
          }
        }
      }
    }

    // Находим продукт с максимальным количеством
    let topProduct: OrderStats['topProduct'] = null;
    let maxCount = 0;

    for (const product of productCounts.values()) {
      if (product.count > maxCount) {
        maxCount = product.count;
        topProduct = product;
      }
    }

    return topProduct;
  } catch (error) {
    console.error('[GET_TOP_PRODUCT] Error:', error);
    return null;
  }
}
